import tkinter as tk
from tkinter import ttk, messagebox
import matplotlib.pyplot as plt
import matplotlib as mpl
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np
from scipy.fft import fft, fftfreq

class SignalEncoderGUI:
    def __init__(self, root):
        self.root = root
        root.title("Digital Signal Encoder Simulator")

        # Top frame for inputs
        top_frame = tk.Frame(root)
        top_frame.grid(row=0, column=0, columnspan=2, sticky="ew", padx=20, pady=10)

        tk.Label(top_frame, text="Enter Binary Code:").grid(row=0, column=0, sticky="e", padx=10, pady=10)
        self.binary_entry = tk.Entry(top_frame, width=40)
        self.binary_entry.grid(row=0, column=1, padx=10, pady=10, sticky="w")
        self.binary_entry.insert(0, "10110010") # Default value for demonstration

        tk.Label(top_frame, text="Select Encoding Method:").grid(row=1, column=0, sticky="e", padx=10, pady=10)
        self.method_var = tk.StringVar()
        self.method_combo = ttk.Combobox(top_frame, textvariable=self.method_var, state="readonly")
        self.method_combo['values'] = ("NRZ", "NRZ-L", "NRZ-I", "RZ", "Manchester", "Differential Manchester")
        self.method_combo.current(0)
        self.method_combo.grid(row=1, column=1, padx=10, pady=10, sticky="w")

        tk.Label(top_frame, text="Channel Bandwidth (Hz):").grid(row=2, column=0, sticky="e", padx=10, pady=10)
        self.freq_entry = tk.Entry(top_frame, width=10)
        self.freq_entry.grid(row=2, column=1, padx=10, pady=10, sticky="w")
        self.freq_entry.insert(0, "5") # Default value for demonstration

        # Middle frame for buttons
        button_frame = tk.Frame(root)
        button_frame.grid(row=1, column=0, columnspan=2, sticky="ew", padx=20, pady=5)
        button_frame.columnconfigure(0, weight=1)
        button_frame.columnconfigure(1, weight=1)

        self.encode_button = tk.Button(button_frame, text="Encode & Transmit", command=self.encode_and_transmit, width=20)
        self.encode_button.grid(row=0, column=0, padx=10, pady=10)

        self.decode_button = tk.Button(button_frame, text="Decode at Receiver", command=self.decode_signal, width=20)
        self.decode_button.grid(row=0, column=1, padx=10, pady=10)

        # Output label frame
        output_frame = tk.Frame(root)
        output_frame.grid(row=2, column=0, columnspan=2, sticky="ew", padx=20, pady=5)
        self.output_label = tk.Label(output_frame, text="Decoded Output: ", fg="blue", font=("Arial", 12, "bold"))
        self.output_label.pack(padx=10, pady=10)

        # Matplotlib Figure
        plot_frame = tk.Frame(root)
        plot_frame.grid(row=3, column=0, columnspan=2, sticky="nsew", padx=20, pady=10)
        # set default subplot wspace for the application
        mpl.rcParams['figure.subplot.wspace'] = 0.394

        self.figure = plt.Figure(figsize=(10, 8), dpi=100)
        self.figure.tight_layout(pad=3.0)
        self.ax_input = self.figure.add_subplot(311)
        self.ax_output = self.figure.add_subplot(312)
        self.ax_fft = self.figure.add_subplot(313)
        self.canvas = FigureCanvasTkAgg(self.figure, master=plot_frame)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)
        
        # Configure resizing behavior
        self.root.grid_rowconfigure(3, weight=1)
        self.root.grid_columnconfigure(0, weight=1)

        # Store signal for decoding
        self.encoded_signal = None
        self.t = None
        self.method = None
        self.filtered_signal = None

    def encode_and_transmit(self):
        binary_str = self.binary_entry.get().strip()
        self.method = self.method_var.get()
        try:
            freq = float(self.freq_entry.get())
        except ValueError:
            messagebox.showerror("Error", "Please enter a valid frequency.")
            return

        if not all(c in '01' for c in binary_str) or not binary_str:
            messagebox.showerror("Error", "Please enter a valid binary code.")
            return

        bits = [int(b) for b in binary_str]
        self.t, self.encoded_signal = self.encode_signal(bits, self.method)

        # Simulate channel: apply low-pass filter
        self.filtered_signal = self.low_pass_filter(self.encoded_signal, freq, self.t)

        # Plot input (encoded) signal
        self.ax_input.clear()
        self.ax_input.plot(self.t, self.encoded_signal, drawstyle='steps-post')
        self.ax_input.set_title(f"Encoded Signal ({self.method})")
        self.ax_input.set_xlabel("Time (s)")
        self.ax_input.set_ylabel("Voltage")
        self.ax_input.grid(True)
        self.ax_input.set_ylim(-1.5, 1.5)

        # Plot output (received) signal
        self.ax_output.clear()
        self.ax_output.plot(self.t, self.filtered_signal) # Plotting without 'steps-post' shows the filter effect better
        self.ax_output.set_title(f"Received Signal (After Low-Pass Filter at {freq} Hz)")
        self.ax_output.set_xlabel("Time (s)")
        self.ax_output.set_ylabel("Voltage")
        self.ax_output.grid(True)
        self.ax_output.set_ylim(-1.5, 1.5)

        # Fourier analysis of input signal
        N = len(self.encoded_signal)
        dt = self.t[1] - self.t[0] if len(self.t) > 1 else 1
        freqs = fftfreq(N, dt)
        fft_vals = np.abs(fft(self.encoded_signal))
        
        self.ax_fft.clear()
        self.ax_fft.plot(freqs[:N//2], 2.0/N * fft_vals[:N//2]) # Normalized magnitude
        self.ax_fft.set_title("Frequency Spectrum of Encoded Signal (FFT)")
        self.ax_fft.set_xlabel("Frequency (Hz)")
        self.ax_fft.set_ylabel("Magnitude")
        self.ax_fft.axvline(x=freq, color='r', linestyle='--', label=f'Cutoff Freq ({freq} Hz)')
        self.ax_fft.legend()
        self.ax_fft.grid(True)

        self.canvas.draw()
        self.output_label.config(text="Decoded Output: ")

    def decode_signal(self):
        if self.filtered_signal is None or self.t is None or self.method is None:
            messagebox.showerror("Error", "No signal to decode. Please encode and transmit first.")
            return
        
        decoded_bits = self.decode_from_signal(self.filtered_signal, self.method)
        decoded_str = ''.join(str(b) for b in decoded_bits)
        self.output_label.config(text=f"Decoded Output: {decoded_str}")

    def encode_signal(self, bits, method):
        samples_per_bit = 100
        t = np.linspace(0, len(bits), len(bits) * samples_per_bit, endpoint=False)
        signal = np.zeros(len(t))
        current_level = 1

        for i, bit in enumerate(bits):
            start = i * samples_per_bit
            end = (i + 1) * samples_per_bit
            mid = start + samples_per_bit // 2
            
            if method == "NRZ":
                signal[start:end] = 1 if bit == 1 else 0
            elif method == "NRZ-L":
                signal[start:end] = 1 if bit == 1 else -1
            elif method == "NRZ-I":
                if bit == 1:
                    current_level *= -1
                signal[start:end] = current_level
            elif method == "RZ":
                if bit == 1:
                    signal[start:mid] = 1
            elif method == "Manchester":
                if bit == 1: # High-to-Low
                    signal[start:mid] = 1
                    signal[mid:end] = -1
                else: # Low-to-High
                    signal[start:mid] = -1
                    signal[mid:end] = 1
            elif method == "Differential Manchester":
                if bit == 0: # Transition at start of bit
                    current_level *= -1
                # Always transition in the middle
                signal[start:mid] = current_level
                signal[mid:end] = -current_level
                current_level *= -1 # Level for next bit starts where this one ended

        return t, signal

    def low_pass_filter(self, signal, cutoff_freq, t):
        N = len(signal)
        dt = t[1] - t[0] if len(t) > 1 else 1
        freqs = fftfreq(N, dt)
        fft_signal = fft(signal)
        
        # Zero out frequencies above the cutoff
        fft_signal[np.abs(freqs) > cutoff_freq] = 0
        
        filtered = np.real(np.fft.ifft(fft_signal))
        return filtered

    def decode_from_signal(self, signal, method):
        samples_per_bit = 100
        n_bits = len(signal) // samples_per_bit
        decoded_bits = []
        
        # --- FIX: Assume initial levels for differential schemes ---
        last_level = 1 # For NRZ-I
        last_half_level = 1 # For Differential Manchester
        
        for i in range(n_bits):
            start = i * samples_per_bit
            end = (i + 1) * samples_per_bit
            mid = start + samples_per_bit // 2
            segment = signal[start:end]

            if method == "NRZ":
                decoded_bits.append(1 if np.mean(segment) > 0.5 else 0)
            elif method == "NRZ-L":
                decoded_bits.append(1 if np.mean(segment) > 0 else 0)
            elif method == "NRZ-I":
                # --- FIX: Correct differential logic ---
                current_level = np.mean(segment)
                if np.sign(current_level) != np.sign(last_level):
                    decoded_bits.append(1) # Transition means 1
                else:
                    decoded_bits.append(0) # No transition means 0
                last_level = current_level
            elif method == "RZ":
                first_half_mean = np.mean(signal[start:mid])
                decoded_bits.append(1 if first_half_mean > 0.5 else 0)
            elif method == "Manchester":
                first_half_mean = np.mean(signal[start:mid])
                second_half_mean = np.mean(signal[mid:end])
                if first_half_mean > second_half_mean:
                    decoded_bits.append(1) # High-to-Low
                else:
                    decoded_bits.append(0) # Low-to-High
            elif method == "Differential Manchester":
                # --- FIX: Correct differential logic ---
                current_first_half = np.mean(signal[start:mid])
                if np.sign(current_first_half) == np.sign(last_half_level):
                    decoded_bits.append(1) # No transition at start means 1
                else:
                    decoded_bits.append(0) # Transition at start means 0
                last_half_level = np.mean(signal[mid:end])
                
        return decoded_bits

if __name__ == "__main__":
    root = tk.Tk()
    app = SignalEncoderGUI(root)
    root.mainloop()