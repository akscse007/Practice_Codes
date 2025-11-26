import java.io.*;
import java.net.*;

public class Receiver {
    private ServerSocket serverSocket;
    private Socket clientSocket;
    private ObjectOutputStream output;
    private ObjectInputStream input;
    private ProtocolConfig config;
    private int expectedSequenceNumber;
    
    public Receiver(int port, ProtocolConfig config) throws IOException {
        this.serverSocket = new ServerSocket(port);
        this.config = config;
        this.expectedSequenceNumber = 0;
        
        System.out.println("Receiver started on port " + port);
        System.out.println("Using configuration: " + config);
    }
    
    public String start() throws IOException, ClassNotFoundException {
        System.out.println("Waiting for sender to connect...");
        clientSocket = serverSocket.accept();
        output = new ObjectOutputStream(clientSocket.getOutputStream());
        input = new ObjectInputStream(clientSocket.getInputStream());

        System.out.println("Sender connected from: " + clientSocket.getInetAddress());

        ByteArrayOutputStream receivedData = new ByteArrayOutputStream();

        boolean running = true; // Add a running flag to control the loop

        while (running) {
            Frame frame = receiveFrame();

            if (frame == null) {
                System.out.println("Connection closed by sender");
                running = false; // Exit the loop
                continue;
            }

            System.out.println("Received: " + frame);

            // Simulate propagation delay
            simulatePropagationDelay();

            if (!frame.isAck() && !frame.isNak()) {
                if (frame.getSequenceNumber() == expectedSequenceNumber) {
                    // Correct frame received
                    receivedData.write(frame.getData());
                    sendAck(expectedSequenceNumber);
                    System.out.println("Sent ACK for frame " + expectedSequenceNumber);
                    expectedSequenceNumber = 1 - expectedSequenceNumber; // Toggle 0/1
                } else {
                    // Duplicate or out-of-order frame
                    sendAck(1 - expectedSequenceNumber); // Send ACK for previous frame
                    System.out.println("Sent duplicate ACK for frame " + (1 - expectedSequenceNumber));
                }
            }
        }

        // Return the received data as a string
        return receivedData.toString();
    }
    
    private Frame receiveFrame() {
        try {
            return (Frame) input.readObject();
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("Error receiving frame: " + e.getMessage());
            return null;
        }
    }
    
    private void sendAck(int sequenceNumber) throws IOException {
        Frame ackFrame = new Frame(sequenceNumber, true);
        output.writeObject(ackFrame);
        output.flush();
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
            if (clientSocket != null) clientSocket.close();
            if (serverSocket != null) serverSocket.close();
        } catch (IOException e) {
            System.out.println("Error closing receiver: " + e.getMessage());
        }
    }
}