# graph.py
from flask import Flask, request, jsonify, render_template
import os
import csv
import json
import math

# --- Wichtige Änderung hier: pyplot als plt importieren ---
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename

import io
import base64

# --- Graph Analysis Functions ---

def read_adjacency_matrix_from_csv(filepath):
    """
    Reads the adjacency matrix of a graph from a CSV file.
    """
    try:
        with open(filepath, 'r') as file:
            reader = csv.reader(file)
            adj_matrix = []
            for row in reader:
                adj_matrix.append([float(x) for x in row])
            return adj_matrix
    except FileNotFoundError:
        print(f"Error: CSV file '{filepath}' not found.")
        return None
    except ValueError:
        print(f"Error: Invalid value in the CSV file. Ensure all values are numbers.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while reading the CSV file: {e}")
        return None

def read_adjacency_matrix_from_json(filepath):
    """
    Reads the adjacency matrix of a graph from a JSON file.
    """
    try:
        with open(filepath, 'r') as file:
            adj_matrix = json.load(file)
            if not isinstance(adj_matrix, list) or not all(isinstance(row, list) for row in adj_matrix):
                print(f"Error: JSON file '{filepath}' does not contain a valid matrix format (list of lists).")
                return None
            
            processed_matrix = []
            for row in adj_matrix:
                processed_row = []
                for val in row:
                    try:
                        processed_row.append(float(val))
                    except ValueError:
                        print(f"Error: Invalid numeric value '{val}' in the JSON file.")
                        return None
                processed_matrix.append(processed_row)
            return processed_matrix
    except FileNotFoundError:
        print(f"Error: JSON file '{filepath}' not found.")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing the JSON file '{filepath}': {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while reading the JSON file: {e}")
        return None

def calculate_distances_and_paths(adj_matrix):
    """
    Calculates the distance matrix (shortest paths) and the predecessor matrix
    using the Floyd-Warshall algorithm for a weighted graph.
    """
    num_nodes = len(adj_matrix)
    dist_matrix = [[math.inf] * num_nodes for _ in range(num_nodes)]
    pred_matrix = [[-1] * num_nodes for _ in range(num_nodes)]

    for i in range(num_nodes):
        for j in range(num_nodes):
            if i == j:
                dist_matrix[i][j] = 0.0
                pred_matrix[i][j] = i
            elif adj_matrix[i][j] > 0:
                dist_matrix[i][j] = adj_matrix[i][j]
                pred_matrix[i][j] = i

    for k in range(num_nodes):
        for i in range(num_nodes):
            for j in range(num_nodes):
                if dist_matrix[i][k] != math.inf and dist_matrix[k][j] != math.inf:
                    if dist_matrix[i][j] > dist_matrix[i][k] + dist_matrix[k][j]:
                        dist_matrix[i][j] = dist_matrix[i][k] + dist_matrix[k][j]
                        pred_matrix[i][j] = pred_matrix[k][j]
    return dist_matrix, pred_matrix

def reconstruct_path(start_node, end_node, pred_matrix, node_names=None):
    """
    Reconstructs the shortest path from start_node to end_node using the predecessor matrix.
    Uses node_names for path representation if provided, otherwise uses indices.
    """
    if pred_matrix[start_node][end_node] == -1:
        if start_node == end_node:
            return [str(start_node)] if node_names is None else [node_names[start_node]]
        return None
    
    path_indices = []
    current_node = end_node
    
    while current_node != start_node:
        if current_node == -1 or pred_matrix[start_node][current_node] == -1:
            return None 
        path_indices.insert(0, current_node)
        current_node = pred_matrix[start_node][current_node]
    path_indices.insert(0, start_node)

    if node_names:
        if max(path_indices) >= len(node_names) or min(path_indices) < 0:
            print(f"Warning: Node index in path ({max(path_indices)} or {min(path_indices)}) out of bounds for provided node_names ({len(node_names)}). Using indices instead.")
            return [str(idx) for idx in path_indices]
        return [node_names[idx] for idx in path_indices]
    else:
        return [str(idx) for idx in path_indices]

def calculate_eccentricities(dist_matrix):
    """
    Calculates the eccentricity of each node from the distance matrix.
    """
    num_nodes = len(dist_matrix)
    eccentricities = []
    for i in range(num_nodes):
        max_dist = 0.0
        has_unreachable = False
        for j in range(num_nodes):
            if dist_matrix[i][j] == math.inf:
                has_unreachable = True
                break
            if dist_matrix[i][j] > max_dist:
                max_dist = dist_matrix[i][j]
        
        if has_unreachable:
            eccentricities.append(math.inf)
        else:
            eccentricities.append(max_dist)
    return eccentricities

def calculate_radius(eccentricities):
    """
    Calculates the radius of the graph.
    """
    if not eccentricities or all(e == math.inf for e in eccentricities):
        return math.inf
    finite_eccentricities = [e for e in eccentricities if e != math.inf]
    if not finite_eccentricities:
        return math.inf
    return min(finite_eccentricities)

def calculate_diameter(eccentricities):
    """
    Calculates the diameter of the graph.
    """
    if not eccentricities:
        return math.inf
    if any(e == math.inf for e in eccentricities):
        return math.inf
    return max(eccentricities)

def find_center_nodes(eccentricities, radius):
    """
    Finds the nodes that belong to the center of the graph.
    """
    if radius == math.inf:
        return []
    center_nodes = [i for i, ecc in enumerate(eccentricities) if ecc == radius]
    return center_nodes

# --- GEÄNDERTE Visualisierungsfunktion OHNE NetworkX ---
def plot_graph_to_base64(adj_matrix, node_names=None):
    """
    Draws the graph from the adjacency matrix using pure Matplotlib
    and returns it as a Base64-encoded image.
    Generates a simple circular layout for node positions.
    """
    num_nodes = len(adj_matrix)
    
    if num_nodes == 0:
        return None # No visualization for empty graph

    plt.figure(figsize=(8, 6)) # Size of the plot

    # --- 1. Determine Node Positions (e.g., Circular Layout) ---
    node_positions = {}
    radius = 1.0 # Radius of the circle
    center_x, center_y = 0.0, 0.0 # Center of the circle

    for i in range(num_nodes):
        angle = 2 * math.pi * i / num_nodes
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        node_positions[i] = (x, y)

    # --- 2. Draw Edges ---
    # Assumption: Undirected graph, draw each edge only once (i,j)
    for i in range(num_nodes):
        for j in range(i + 1, num_nodes): # Only upper triangle matrix for undirected graph
            weight = adj_matrix[i][j]
            if weight > 0 and weight != math.inf:
                x1, y1 = node_positions[i]
                x2, y2 = node_positions[j]
                
                # Draw the line
                plt.plot([x1, x2], [y1, y2], color='gray', linewidth=2, alpha=0.7)
                
                # Position for the edge weight (middle of the edge)
                mid_x = (x1 + x2) / 2
                mid_y = (y1 + y2) / 2
                plt.text(mid_x, mid_y, f"{weight}", color='red', fontsize=10, 
                         ha='center', va='center', 
                         bbox=dict(facecolor='white', alpha=0.7, edgecolor='none', boxstyle='round,pad=0.2'))

    # --- 3. Draw Nodes ---
    node_x = [pos[0] for pos in node_positions.values()]
    node_y = [pos[1] for pos in node_positions.values()]
    
    # plt.scatter draws the node points
    plt.scatter(node_x, node_y, s=2000, color='skyblue', alpha=0.9, zorder=2) # zorder for layering

    # --- 4. Draw Node Names/Labels ---
    for i, (x, y) in node_positions.items():
        display_name = ""
        if node_names and i < len(node_names):
            display_name = node_names[i]
        else:
            display_name = str(i) # Fallback to index if no names or list too short
        
        plt.text(x, y, display_name, color='black', fontsize=12,
                 ha='center', va='center', zorder=3) # zorder for layering

    # --- General Plot Settings ---
    plt.xlim(-1.2, 1.2) # Set limits for the plot
    plt.ylim(-1.2, 1.2)
    plt.axis('off') # Hide axes
    plt.tight_layout() # Adjust layout to prevent labels from being cut off

    # Save the image to a bytes buffer and encode in Base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight')
    buffer.seek(0)
    plt.close() # Close the figure to free up memory

    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{image_base64}"


# --- Flask App Setup ---
app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'json'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper to generate alphabetical names (A, B, C... AA, AB...)
def generate_alphabetical_node_names(num_nodes):
    names = []
    for i in range(num_nodes):
        name = ""
        n = i
        # This loop generates names like A, B, ..., Z, AA, AB, ...
        # Based on a 1-indexed alphabet for calculation (A=1, B=2)
        # but 0-indexed in actual char code.
        # Adjusted for 0-based indexing as the loop variable n works
        while True:
            remainder = n % 26
            name = chr(65 + remainder) + name # 65 is ASCII for 'A'
            n = n // 26 - 1 # Adjusted for 0-indexing of alphabet
            if n < 0: # When n becomes -1 after division, it means we're done
                break
        names.append(name)
    return names


@app.route('/')
def index():
    return render_template('index1.html') # Adjusted to index1.html

@app.route('/api/analyze', methods=['POST'])
def analyze_graph():
    if 'file' not in request.files:
        return jsonify(success=False, error="No file found in the request."), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify(success=False, error="No file selected."), 400

    start_node_str = request.form.get('start_node')
    end_node_str = request.form.get('end_node')

    try:
        start_node_idx = int(start_node_str)
        end_node_idx = int(end_node_str)
    except (ValueError, TypeError):
        return jsonify(success=False, error="Invalid start or end node index. Must be integers."), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        adj_matrix = None
        file_extension = filename.rsplit('.', 1)[1].lower()

        if file_extension == 'csv':
            adj_matrix = read_adjacency_matrix_from_csv(filepath)
        elif file_extension == 'json':
            adj_matrix = read_adjacency_matrix_from_json(filepath)

        os.remove(filepath)

        if adj_matrix is None:
            return jsonify(success=False, error="Error reading the adjacency matrix. Invalid format or content."), 400
        
        num_nodes = len(adj_matrix)
        # Validate node indices against the matrix size
        if not (0 <= start_node_idx < num_nodes and 0 <= end_node_idx < num_nodes):
            return jsonify(success=False, error=f"Start or end node index out of bounds. Graph has {num_nodes} nodes (0 to {num_nodes-1})."), 400
        
        # --- Dynamically generate node names ---
        node_names = generate_alphabetical_node_names(num_nodes)


        try:
            dist_matrix, pred_matrix = calculate_distances_and_paths(adj_matrix)
            
            # Use the dynamically generated names for path reconstruction
            shortest_path_nodes = reconstruct_path(start_node_idx, end_node_idx, pred_matrix, node_names)
            shortest_path_distance = dist_matrix[start_node_idx][end_node_idx]
            
            shortest_path_formatted_str = " -> ".join(shortest_path_nodes) if shortest_path_nodes else None

            eccentricities = calculate_eccentricities(dist_matrix)
            radius = calculate_radius(eccentricities)
            diameter = calculate_diameter(eccentricities)
            
            center_nodes_indices = find_center_nodes(eccentricities, radius)
            # Convert center nodes indices to their generated names
            center_nodes_names = [node_names[idx] for idx in center_nodes_indices]

            # Convert eccentricities to named output
            ecc_output_named = [
                f"{node_names[i]}: {round(e, 2) if e != math.inf else 'Infinity'}" 
                for i, e in enumerate(eccentricities)
            ]

            radius_output = round(radius, 2) if radius != math.inf else "Infinity"
            diameter_output = round(diameter, 2) if diameter != math.inf else "Infinity"

            # Pass generated node_names to plot_graph_to_base64
            graph_image_base64 = plot_graph_to_base64(adj_matrix, node_names) 

            return jsonify(success=True, results={
                "radius": radius_output,
                "diameter": diameter_output,
                "center_nodes": center_nodes_names,
                "eccentricities": ecc_output_named,
                "shortest_path_distance": round(shortest_path_distance, 2) if shortest_path_distance != math.inf else "Infinity",
                "shortest_path_formatted": shortest_path_formatted_str,
                "graph_image": graph_image_base64
            })
        except Exception as e:
            return jsonify(success=False, error=f"Error during graph analysis: {str(e)}"), 500
    else:
        return jsonify(success=False, error="File type not allowed. Only .csv or .json are permitted."), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
          