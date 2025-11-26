import java.io.*;
import java.util.Arrays;
import java.net.*;
import java.util.concurrent.*;

public class Sender {
    private Socket socket;
    private ObjectOutputStream output;
    private ObjectInputStream input;
    private ProtocolConfig config;
    private int currentSequenceNumber;
    private ScheduledExecutorService scheduler;
    
    public Sender(String host, int port, ProtocolConfig config) throws IOException {
        this.socket = new Socket(host, port);
        this.output = new ObjectOutputStream(socket.getOutputStream());
        this.input = new ObjectInputStream(socket.getInputStream());
        this.config = config;
        this.currentSequenceNumber = 0;
        this.scheduler = Executors.newScheduledThreadPool(1);
        
        System.out.println("Sender connected to " + host + ":" + port);
        System.out.println("Using configuration: " + config);
    }
    
    public void sendData(byte[] data) throws IOException, ClassNotFoundException {
        if (data.length == 0) {
            System.out.println("No data to send. Exiting.");
            return; // Exit if no data is provided
        }

        int totalFrames = (int) Math.ceil((double) data.length / config.getFrameSize());
        System.out.println("Sending " + data.length + " bytes in " + totalFrames + " frames");

        for (int i = 0; i < totalFrames; i++) {
            int start = i * config.getFrameSize();
            int end = Math.min(start + config.getFrameSize(), data.length);
            byte[] frameData = Arrays.copyOfRange(data, start, end);

            boolean frameSent = false;
            int retransmissionCount = 0;

            while (!frameSent && retransmissionCount <= config.getMaxRetransmissions()) {
                Frame frame = new Frame(currentSequenceNumber, frameData);
                sendFrame(frame);
                System.out.println("Sent: " + frame);

                // Simulate propagation delay
                simulatePropagationDelay();

                Frame response = waitForAck();

                if (response != null && response.isAck() && 
                    response.getSequenceNumber() == currentSequenceNumber) {
                    System.out.println("Received ACK for frame " + currentSequenceNumber);
                    frameSent = true;
                    currentSequenceNumber = 1 - currentSequenceNumber; // Toggle 0/1
                } else {
                    retransmissionCount++;
                    if (retransmissionCount <= config.getMaxRetransmissions()) {
                        System.out.println("Timeout/NAK - Retransmitting frame " + 
                                          currentSequenceNumber + " (attempt " + retransmissionCount + ")");
                    } else {
                        System.out.println("Max retransmissions reached for frame " + 
                                          currentSequenceNumber + ". Aborting.");
                        throw new IOException("Transmission failed after " + 
                                            config.getMaxRetransmissions() + " retries");
                    }
                }
            }
        }

        System.out.println("All data sent successfully!");
    }
    
    private void sendFrame(Frame frame) throws IOException {
        output.writeObject(frame);
        output.flush();
    }
    
    private Frame waitForAck() {
        try {
            socket.setSoTimeout(config.getTimeout());
            return (Frame) input.readObject();
        } catch (SocketTimeoutException e) {
            System.out.println("Timeout waiting for ACK");
            return null;
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("Error waiting for ACK: " + e.getMessage());
            return null;
        }
    }
    
    private void simulatePropagationDelay() {
        try {
            Thread.sleep(config.getPropagationDelay());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public void close() {
        try {
            scheduler.shutdown();
            if (socket != null) socket.close();
        } catch (IOException e) {
            System.out.println("Error closing sender: " + e.getMessage());
        }
    }
}