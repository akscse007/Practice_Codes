import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Button, Slider
import tkinter as tk
from tkinter import ttk, messagebox
import matplotlib
matplotlib.use('TkAgg')
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from collections import defaultdict
import random

class PassengerAllocationGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🚌 Passenger Route Allocation System")
        self.root.geometry("1400x900")
        
        # Default parameters
        self.grid_size = 400
        self.num_routes = 20
        self.num_passengers = 30
        self.vehicle_capacity = 15
        self.min_route_length = 500
        
        # Initialize data
        self.routes = []
        self.passengers = []
        self.current_assignment = None
        self.current_method = "Greedy"
        
        self.setup_gui()
        self.generate_new_problem()
        
    def setup_gui(self):
        # Create main frames
        control_frame = ttk.Frame(self.root, padding="10")
        control_frame.pack(side=tk.LEFT, fill=tk.Y)
        
        display_frame = ttk.Frame(self.root, padding="10")
        display_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Control panel
        ttk.Label(control_frame, text="CONTROL PANEL", font=('Arial', 12, 'bold')).pack(pady=10)
        
        # Parameters frame
        param_frame = ttk.LabelFrame(control_frame, text="Parameters", padding="10")
        param_frame.pack(fill=tk.X, pady=5)
        
        # Number of routes
        ttk.Label(param_frame, text="Number of Routes:").grid(row=0, column=0, sticky=tk.W, pady=2)
        self.routes_var = tk.IntVar(value=self.num_routes)
        routes_slider = ttk.Scale(param_frame, from_=5, to=50, variable=self.routes_var, 
                                 orient=tk.HORIZONTAL, command=self.update_routes_label)
        routes_slider.grid(row=0, column=1, sticky=tk.EW, pady=2)
        self.routes_label = ttk.Label(param_frame, text=f"{self.num_routes}")
        self.routes_label.grid(row=0, column=2, padx=5)
        
        # Number of passengers
        ttk.Label(param_frame, text="Number of Passengers:").grid(row=1, column=0, sticky=tk.W, pady=2)
        self.passengers_var = tk.IntVar(value=self.num_passengers)
        passengers_slider = ttk.Scale(param_frame, from_=10, to=100, variable=self.passengers_var, 
                                     orient=tk.HORIZONTAL, command=self.update_passengers_label)
        passengers_slider.grid(row=1, column=1, sticky=tk.EW, pady=2)
        self.passengers_label = ttk.Label(param_frame, text=f"{self.num_passengers}")
        self.passengers_label.grid(row=1, column=2, padx=5)
        
        # Vehicle capacity
        ttk.Label(param_frame, text="Vehicle Capacity:").grid(row=2, column=0, sticky=tk.W, pady=2)
        self.capacity_var = tk.IntVar(value=self.vehicle_capacity)
        capacity_slider = ttk.Scale(param_frame, from_=5, to=50, variable=self.capacity_var, 
                                   orient=tk.HORIZONTAL, command=self.update_capacity_label)
        capacity_slider.grid(row=2, column=1, sticky=tk.EW, pady=2)
        self.capacity_label = ttk.Label(param_frame, text=f"{self.vehicle_capacity}")
        self.capacity_label.grid(row=2, column=2, padx=5)
        
        param_frame.columnconfigure(1, weight=1)
        
        # Algorithm selection
        algo_frame = ttk.LabelFrame(control_frame, text="Optimization Algorithm", padding="10")
        algo_frame.pack(fill=tk.X, pady=10)
        
        self.algo_var = tk.StringVar(value="Greedy")
        algorithms = [("Greedy Algorithm", "Greedy"), 
                     ("Manual ILP", "ILP"),
                     ("Network Flow", "Network")]
        
        for text, value in algorithms:
            ttk.Radiobutton(algo_frame, text=text, variable=self.algo_var, 
                           value=value).pack(anchor=tk.W, pady=2)
        
        # Action buttons
        action_frame = ttk.LabelFrame(control_frame, text="Actions", padding="10")
        action_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(action_frame, text="🔄 Generate New Problem", 
                  command=self.generate_new_problem).pack(fill=tk.X, pady=5)
        ttk.Button(action_frame, text="⚡ Solve Allocation", 
                  command=self.solve_allocation).pack(fill=tk.X, pady=5)
        ttk.Button(action_frame, text="📊 Show Detailed Analysis", 
                  command=self.show_detailed_analysis).pack(fill=tk.X, pady=5)
        ttk.Button(action_frame, text="💾 Export Results", 
                  command=self.export_results).pack(fill=tk.X, pady=5)
        
        # Results display
        results_frame = ttk.LabelFrame(control_frame, text="Live Results", padding="10")
        results_frame.pack(fill=tk.X, pady=10)
        
        self.results_text = tk.Text(results_frame, height=8, width=30, font=('Courier', 9))
        scrollbar = ttk.Scrollbar(results_frame, orient=tk.VERTICAL, command=self.results_text.yview)
        self.results_text.configure(yscrollcommand=scrollbar.set)
        self.results_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Display area for plots
        self.setup_plots(display_frame)
        
    def setup_plots(self, parent):
        # Create matplotlib figure with subplots
        self.fig = plt.Figure(figsize=(10, 8), dpi=100)
        self.canvas = FigureCanvasTkAgg(self.fig, parent)
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # Create subplots
        self.ax1 = self.fig.add_subplot(221)  # Route network
        self.ax2 = self.fig.add_subplot(222)  # Passenger distribution
        self.ax3 = self.fig.add_subplot(223)  # Route utilization
        self.ax4 = self.fig.add_subplot(224)  # Algorithm comparison
        
        self.fig.tight_layout(pad=3.0)
        
    def update_routes_label(self, value):
        self.num_routes = int(float(value))
        self.routes_label.config(text=f"{self.num_routes}")
        
    def update_passengers_label(self, value):
        self.num_passengers = int(float(value))
        self.passengers_label.config(text=f"{self.num_passengers}")
        
    def update_capacity_label(self, value):
        self.vehicle_capacity = int(float(value))
        self.capacity_label.config(text=f"{self.vehicle_capacity}")
        
    def create_grid_and_routes(self):
        """Create grid and routes with minimum length"""
        routes = []
        
        for _ in range(self.num_routes):
            # Create source and destination far apart to ensure minimum length
            source = (np.random.randint(0, self.grid_size//4), 
                     np.random.randint(0, self.grid_size//4))
            dest = (np.random.randint(3*self.grid_size//4, self.grid_size), 
                   np.random.randint(3*self.grid_size//4, self.grid_size))
            
            current = source
            path = [current]
            
            # Generate path using a combination of directed and random movement
            while len(path) < self.min_route_length or current != dest:
                if current == dest:
                    # If reached destination but need more length, do random walk
                    dx, dy = np.random.choice([-2, -1, 0, 1, 2], size=2)
                else:
                    # Move generally towards destination with some randomness
                    dir_x = 1 if dest[0] > current[0] else -1
                    dir_y = 1 if dest[1] > current[1] else -1
                    dx = np.random.choice([dir_x, 0, np.random.choice([-1, 0, 1])])
                    dy = np.random.choice([dir_y, 0, np.random.choice([-1, 0, 1])])
                
                new_x = max(0, min(self.grid_size-1, current[0] + dx))
                new_y = max(0, min(self.grid_size-1, current[1] + dy))
                current = (new_x, new_y)
                
                # Avoid too many consecutive duplicate points
                if not path or current != path[-1]:
                    path.append(current)
                
                if len(path) > self.min_route_length * 3:  # Safety break
                    break
            
            routes.append(path)
        
        return routes
    
    def create_passengers(self, routes):
        """Create passengers with boarding and alighting points served by routes"""
        passengers = []
        
        for i in range(self.num_passengers):
            # Try multiple routes to find a valid passenger
            valid_passenger = False
            attempts = 0
            
            while not valid_passenger and attempts < 100:
                route_idx = np.random.randint(0, len(routes))
                route = routes[route_idx]
                
                if len(route) >= 10:  # Ensure route has enough points
                    # Choose indices far enough apart
                    min_gap = min(20, len(route) // 3)
                    boarding_idx = np.random.randint(0, len(route) - min_gap)
                    alighting_idx = np.random.randint(boarding_idx + min_gap, len(route))
                    
                    boarding_point = route[boarding_idx]
                    alighting_point = route[alighting_idx]
                    
                    # Ensure points are different
                    if boarding_point != alighting_point:
                        passengers.append({
                            'id': i,
                            'boarding': boarding_point,
                            'alighting': alighting_point,
                            'serving_routes': [route_idx]
                        })
                        valid_passenger = True
                
                attempts += 1
        
        return passengers
    
    def find_all_serving_routes(self, passengers, routes):
        """Find all routes that can serve each passenger"""
        for passenger in passengers:
            serving_routes = []
            boarding = passenger['boarding']
            alighting = passenger['alighting']
            
            for route_idx, route in enumerate(routes):
                try:
                    boarding_idx = route.index(boarding)
                    alighting_idx = route.index(alighting)
                    if boarding_idx < alighting_idx:
                        serving_routes.append(route_idx)
                except ValueError:
                    continue
            
            passenger['serving_routes'] = serving_routes
        
        return passengers
    
    def solve_greedy_allocation(self, passengers, routes):
        """Solve using greedy allocation algorithm"""
        num_passengers = len(passengers)
        num_routes = len(routes)
        
        # Initialize assignment matrix
        assignment = np.zeros((num_passengers, num_routes), dtype=int)
        
        # Track capacity usage for each route
        route_usage = np.zeros(num_routes, dtype=int)
        
        # Sort passengers by number of available routes (fewer options first)
        passengers_sorted = sorted(enumerate(passengers), 
                                  key=lambda x: len(x[1]['serving_routes']))
        
        # Greedy assignment
        for orig_idx, passenger in passengers_sorted:
            serving_routes = passenger['serving_routes']
            
            # Try to assign to a route with available capacity
            assigned = False
            for route_idx in serving_routes:
                if route_usage[route_idx] < self.vehicle_capacity:
                    assignment[orig_idx, route_idx] = 1
                    route_usage[route_idx] += 1
                    assigned = True
                    break
            
            # If no route available, try to find route with minimum usage
            if not assigned and serving_routes:
                min_usage_route = min(serving_routes, key=lambda r: route_usage[r])
                if route_usage[min_usage_route] < self.vehicle_capacity:
                    assignment[orig_idx, min_usage_route] = 1
                    route_usage[min_usage_route] += 1
        
        # Calculate total passengers served
        total_served = np.sum(assignment)
        
        return assignment, total_served, route_usage
    
    def solve_ilp_manual(self, passengers, routes):
        """Solve using manual Integer Linear Programming with greedy improvement"""
        num_passengers = len(passengers)
        num_routes = len(routes)
        
        # Start with greedy solution
        assignment, current_score, route_usage = self.solve_greedy_allocation(passengers, routes)
        
        # Try to improve the solution
        best_assignment = assignment.copy()
        best_score = current_score
        best_route_usage = route_usage.copy()
        
        # Try passenger swaps
        for p1 in range(num_passengers):
            for p2 in range(p1 + 1, num_passengers):
                if (best_assignment[p1].sum() == 0 and 
                    best_assignment[p2].sum() == 1 and
                    p1 < len(passengers) and p2 < len(passengers)):
                    
                    # p1 is unserved, p2 is served - try to swap
                    p2_route = np.argmax(best_assignment[p2])
                    if (p2_route in passengers[p1]['serving_routes'] and 
                        best_route_usage[p2_route] <= self.vehicle_capacity):
                        
                        # Try the swap
                        best_assignment[p2, p2_route] = 0
                        best_assignment[p1, p2_route] = 1
                        best_route_usage[p2_route] = best_route_usage[p2_route]  # Same usage
                        
                        new_score = np.sum(best_assignment)
                        if new_score > best_score:
                            best_score = new_score
                        else:
                            # Revert
                            best_assignment[p1, p2_route] = 0
                            best_assignment[p2, p2_route] = 1
        
        return best_assignment, best_score, best_route_usage
    
    def solve_network_flow(self, passengers, routes):
        """Simplified network flow implementation"""
        num_passengers = len(passengers)
        num_routes = len(routes)
        
        assignment = np.zeros((num_passengers, num_routes), dtype=int)
        route_load = np.zeros(num_routes, dtype=int)
        
        # Build passenger-route compatibility
        passenger_options = []
        for passenger in passengers:
            passenger_options.append(passenger['serving_routes'])
        
        # Sort passengers by number of options (fewer first)
        sorted_indices = sorted(range(num_passengers), 
                               key=lambda i: len(passenger_options[i]))
        
        total_served = 0
        for p_idx in sorted_indices:
            assigned = False
            # Try routes in order
            for route_idx in passenger_options[p_idx]:
                if route_load[route_idx] < self.vehicle_capacity:
                    assignment[p_idx, route_idx] = 1
                    route_load[route_idx] += 1
                    total_served += 1
                    assigned = True
                    break
        
        return assignment, total_served, route_load
    
    def generate_new_problem(self):
        """Generate a completely new problem instance"""
        try:
            # Update parameters from GUI
            self.num_routes = self.routes_var.get()
            self.num_passengers = self.passengers_var.get()
            self.vehicle_capacity = self.capacity_var.get()
            
            # Generate new data
            self.routes = self.create_grid_and_routes()
            self.passengers = self.create_passengers(self.routes)
            self.passengers = self.find_all_serving_routes(self.passengers, self.routes)
            self.current_assignment = None
            
            # Update results display
            self.update_results_display()
            
            # Visualize the new problem
            self.visualize_problem()
            
            messagebox.showinfo("Success", "New problem generated successfully!")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate problem: {str(e)}")
    
    def solve_allocation(self):
        """Solve the allocation problem with selected algorithm"""
        if not self.routes or not self.passengers:
            messagebox.showwarning("Warning", "Please generate a problem first!")
            return
        
        try:
            method = self.algo_var.get()
            self.current_method = method
            
            if method == "Greedy":
                assignment, score, route_usage = self.solve_greedy_allocation(self.passengers, self.routes)
            elif method == "ILP":
                assignment, score, route_usage = self.solve_ilp_manual(self.passengers, self.routes)
            else:  # Network
                assignment, score, route_usage = self.solve_network_flow(self.passengers, self.routes)
            
            self.current_assignment = assignment
            self.current_route_usage = route_usage
            self.current_score = score
            
            # Update display and visualization
            self.update_results_display()
            self.visualize_solution()
            
            messagebox.showinfo("Solution Found", 
                              f"{method} algorithm served {score}/{len(self.passengers)} passengers!")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to solve allocation: {str(e)}")
    
    def update_results_display(self):
        """Update the results text display"""
        if not self.passengers:
            return
        
        served_count = 0
        if self.current_assignment is not None:
            served_count = np.sum(self.current_assignment)
        
        # Calculate statistics
        total_passengers = len(self.passengers)
        passengers_with_routes = sum(1 for p in self.passengers if p['serving_routes'])
        service_rate = (served_count / total_passengers * 100) if total_passengers > 0 else 0
        
        results_text = f"""
PROBLEM STATISTICS:
────────────────────────────────
Total Routes: {len(self.routes)}
Total Passengers: {total_passengers}
Passengers with Route Options: {passengers_with_routes}
Vehicle Capacity: {self.vehicle_capacity}

SOLUTION RESULTS:
────────────────────────────────
Method: {self.current_method if self.current_assignment is not None else 'Not Solved'}
Passengers Served: {served_count}
Service Rate: {service_rate:.1f}%

ROUTE INFORMATION:
────────────────────────────────
"""
        # Add route lengths
        for i, route in enumerate(self.routes):
            results_text += f"Route {i+1:2d}: {len(route):4d} points\n"
        
        self.results_text.delete(1.0, tk.END)
        self.results_text.insert(1.0, results_text)
    
    def visualize_problem(self):
        """Visualize the problem without solution"""
        self.clear_plots()
        
        # Plot 1: Route network
        colors = plt.cm.Set3(np.linspace(0, 1, len(self.routes)))
        
        for i, route in enumerate(self.routes):
            if len(route) > 1:
                x_coords = [point[0] for point in route]
                y_coords = [point[1] for point in route]
                self.ax1.plot(x_coords, y_coords, color=colors[i], alpha=0.6, 
                             linewidth=1, label=f'Route {i+1}')
        
        # Plot passenger points
        for passenger in self.passengers:
            self.ax1.plot(passenger['boarding'][0], passenger['boarding'][1], 
                         'bo', markersize=6, alpha=0.7)
            self.ax1.plot(passenger['alighting'][0], passenger['alighting'][1], 
                         'rs', markersize=6, alpha=0.7)
        
        self.ax1.set_xlim(0, self.grid_size)
        self.ax1.set_ylim(0, self.grid_size)
        self.ax1.set_title('Route Network (Problem Overview)')
        self.ax1.set_xlabel('X Coordinate')
        self.ax1.set_ylabel('Y Coordinate')
        self.ax1.grid(True, alpha=0.3)
        # legend removed: user requested removal of the route color indicator map
        
        # Plot 2: Passenger options distribution
        options_count = [len(p['serving_routes']) for p in self.passengers]
        self.ax2.hist(options_count, bins=range(0, max(options_count)+2), 
                     alpha=0.7, color='skyblue', edgecolor='black')
        self.ax2.set_xlabel('Number of Available Routes')
        self.ax2.set_ylabel('Number of Passengers')
        self.ax2.set_title('Passenger Route Options Distribution')
        self.ax2.grid(True, alpha=0.3)
        
        # Plot 3: Route lengths
        route_lengths = [len(route) for route in self.routes]
        self.ax3.bar(range(1, len(route_lengths)+1), route_lengths, 
                    alpha=0.7, color='lightgreen')
        self.ax3.set_xlabel('Route Index')
        self.ax3.set_ylabel('Route Length (points)')
        self.ax3.set_title('Route Lengths Distribution')
        self.ax3.grid(True, alpha=0.3)
        
        # Plot 4: Empty for now
        self.ax4.text(0.5, 0.5, 'Solve allocation to see results', 
                     ha='center', va='center', transform=self.ax4.transAxes, fontsize=12)
        self.ax4.set_title('Algorithm Performance')
        self.ax4.axis('off')
        
        self.canvas.draw()
    
    def visualize_solution(self):
        """Visualize the solution"""
        if self.current_assignment is None:
            return
        
        self.clear_plots()
        
        # Plot 1: Route network with passenger assignments
        colors = plt.cm.Set3(np.linspace(0, 1, len(self.routes)))
        
        for i, route in enumerate(self.routes):
            if len(route) > 1:
                x_coords = [point[0] for point in route]
                y_coords = [point[1] for point in route]
                self.ax1.plot(x_coords, y_coords, color=colors[i], alpha=0.6, 
                             linewidth=1, label=f'Route {i+1}')
        
        served_count = 0
        for i, passenger in enumerate(self.passengers):
            served = np.sum(self.current_assignment[i]) > 0
            color = 'green' if served else 'red'
            marker = 'o' if served else 'x'
            
            self.ax1.plot(passenger['boarding'][0], passenger['boarding'][1], 
                         marker, color=color, markersize=8, markeredgewidth=2)
            self.ax1.plot(passenger['alighting'][0], passenger['alighting'][1], 
                         's', color=color, markersize=6)
            
            if served:
                self.ax1.plot([passenger['boarding'][0], passenger['alighting'][0]],
                             [passenger['boarding'][1], passenger['alighting'][1]],
                             '--', color=color, alpha=0.5)
                served_count += 1
        
        self.ax1.set_xlim(0, self.grid_size)
        self.ax1.set_ylim(0, self.grid_size)
        self.ax1.set_title(f'Route Network\n{served_count}/{len(self.passengers)} passengers served')
        self.ax1.set_xlabel('X Coordinate')
        self.ax1.set_ylabel('Y Coordinate')
        self.ax1.grid(True, alpha=0.3)
        # legend removed: user requested removal of the route color indicator map
        
        # Plot 2: Passenger distribution across routes
        route_assignments = defaultdict(int)
        for i, passenger in enumerate(self.passengers):
            if np.sum(self.current_assignment[i]) > 0:
                route_idx = np.argmax(self.current_assignment[i])
                route_assignments[route_idx] += 1
        
        if route_assignments:
            routes_used = list(route_assignments.keys())
            passengers_per_route = [route_assignments[idx] for idx in routes_used]
            
            self.ax2.bar(range(len(routes_used)), passengers_per_route, 
                        color='skyblue', alpha=0.7)
            self.ax2.set_xlabel('Route Index')
            self.ax2.set_ylabel('Number of Passengers')
            self.ax2.set_title('Passenger Distribution Across Routes')
            self.ax2.set_xticks(range(len(routes_used)))
            self.ax2.set_xticklabels([f'R{idx+1}' for idx in routes_used])
            
            for i, v in enumerate(passengers_per_route):
                self.ax2.text(i, v + 0.1, str(v), ha='center', va='bottom')
        else:
            self.ax2.text(0.5, 0.5, 'No passengers served', 
                         ha='center', va='center', transform=self.ax2.transAxes)
            self.ax2.set_title('Passenger Distribution Across Routes')
        
        # Plot 3: Route utilization
        utilization = [(usage / self.vehicle_capacity * 100) 
                      for usage in self.current_route_usage]
        self.ax3.bar(range(len(utilization)), utilization, 
                    color=['green' if u < 80 else 'orange' if u < 95 else 'red' 
                          for u in utilization], alpha=0.7)
        self.ax3.axhline(y=100, color='red', linestyle='--', alpha=0.5)
        self.ax3.set_xlabel('Route Index')
        self.ax3.set_ylabel('Utilization (%)')
        self.ax3.set_title('Route Capacity Utilization')
        self.ax3.set_ylim(0, 120)
        
        for i, v in enumerate(utilization):
            self.ax3.text(i, v + 3, f'{v:.0f}%', ha='center', va='bottom', fontsize=8)
        
        # Plot 4: Compare all algorithms
        algorithms = ['Greedy', 'ILP', 'Network']
        scores = []
        
        # Solve with all methods for comparison
        greedy_assignment, greedy_score, _ = self.solve_greedy_allocation(self.passengers, self.routes)
        ilp_assignment, ilp_score, _ = self.solve_ilp_manual(self.passengers, self.routes)
        network_assignment, network_score, _ = self.solve_network_flow(self.passengers, self.routes)
        
        scores = [greedy_score, ilp_score, network_score]
        
        bars = self.ax4.bar(algorithms, scores, color=['lightblue', 'lightgreen', 'lightcoral'])
        self.ax4.set_ylabel('Passengers Served')
        self.ax4.set_title('Algorithm Performance Comparison')
        self.ax4.grid(True, alpha=0.3)
        
        # Add value labels on bars
        for bar, score in zip(bars, scores):
            height = bar.get_height()
            self.ax4.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                         f'{score}', ha='center', va='bottom')
        
        self.canvas.draw()
    
    def clear_plots(self):
        """Clear all plots"""
        for ax in [self.ax1, self.ax2, self.ax3, self.ax4]:
            ax.clear()
    
    def show_detailed_analysis(self):
        """Show detailed analysis in a new window"""
        if self.current_assignment is None:
            messagebox.showwarning("Warning", "Please solve the allocation first!")
            return
        
        # Create analysis window
        analysis_window = tk.Toplevel(self.root)
        analysis_window.title("Detailed Analysis")
        analysis_window.geometry("600x700")
        
        # Create text widget for analysis
        text_widget = tk.Text(analysis_window, wrap=tk.WORD, font=('Courier', 10))
        scrollbar = ttk.Scrollbar(analysis_window, orient=tk.VERTICAL, command=text_widget.yview)
        text_widget.configure(yscrollcommand=scrollbar.set)
        
        text_widget.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Generate analysis text
        analysis_text = self.generate_analysis_text()
        text_widget.insert(1.0, analysis_text)
        text_widget.config(state=tk.DISABLED)
    
    def generate_analysis_text(self):
        """Generate detailed analysis text"""
        served_count = np.sum(self.current_assignment)
        total_passengers = len(self.passengers)
        
        analysis = f"""
DETAILED ANALYSIS REPORT
{'='*50}

PROBLEM OVERVIEW:
-----------------
Total Routes: {len(self.routes)}
Total Passengers: {total_passengers}
Vehicle Capacity: {self.vehicle_capacity}
Solution Method: {self.current_method}

PERFORMANCE METRICS:
--------------------
Passengers Served: {served_count}
Service Rate: {served_count/total_passengers*100:.1f}%
Unserved Passengers: {total_passengers - served_count}

ROUTE UTILIZATION:
------------------
"""
        # Route utilization details
        for i, usage in enumerate(self.current_route_usage):
            utilization_pct = (usage / self.vehicle_capacity * 100)
            status = "UNDER" if utilization_pct < 60 else "OPTIMAL" if utilization_pct < 90 else "FULL"
            analysis += f"Route {i+1:2d}: {usage:2d}/{self.vehicle_capacity} passengers ({utilization_pct:5.1f}%) - {status}\n"
        
        analysis += f"\nPASSENGER ASSIGNMENTS:\n{'-'*30}\n"
        
        # Passenger assignments
        for i, passenger in enumerate(self.passengers):
            served = np.sum(self.current_assignment[i]) > 0
            if served:
                route_idx = np.argmax(self.current_assignment[i])
                analysis += (f"Passenger {i+1:2d}: SERVED on Route {route_idx+1}\n"
                           f"           Boarding: {passenger['boarding']} -> "
                           f"Alighting: {passenger['alighting']}\n")
            else:
                analysis += (f"Passenger {i+1:2d}: NOT SERVED - "
                           f"Available routes: {len(passenger['serving_routes'])}\n")
        
        # Algorithm comparison
        analysis += f"\nALGORITHM COMPARISON:\n{'-'*25}\n"
        greedy_score = np.sum(self.solve_greedy_allocation(self.passengers, self.routes)[0])
        ilp_score = np.sum(self.solve_ilp_manual(self.passengers, self.routes)[0])
        network_score = np.sum(self.solve_network_flow(self.passengers, self.routes)[0])
        
        analysis += f"Greedy Algorithm: {greedy_score} passengers\n"
        analysis += f"Manual ILP: {ilp_score} passengers\n"
        analysis += f"Network Flow: {network_score} passengers\n"
        analysis += f"Selected Method ({self.current_method}): {served_count} passengers\n"
        
        return analysis
    
    def export_results(self):
        """Export results to file"""
        if self.current_assignment is None:
            messagebox.showwarning("Warning", "Please solve the allocation first!")
            return
        
        try:
            filename = f"passenger_allocation_results.txt"
            with open(filename, 'w') as f:
                f.write(self.generate_analysis_text())
            messagebox.showinfo("Success", f"Results exported to {filename}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export results: {str(e)}")

def main():
    root = tk.Tk()
    app = PassengerAllocationGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()