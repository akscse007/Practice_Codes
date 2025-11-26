import java.io.IOException;
import java.util.Scanner;

public class StopAndWaitProtocol {
    private static final int PORT = 12345;
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Stop and Wait Flow Control Protocol");
        System.out.println("1. Start as Receiver");
        System.out.println("2. Start as Sender");
        System.out.print("Choose mode: ");
        
        int choice = scanner.nextInt();
        scanner.nextLine(); // Consume newline
        
        // Protocol configurations for different scenarios
        ProtocolConfig[] configs = {
            new ProtocolConfig(1024, 100, 2000, 3),    // Small frames, low delay
            new ProtocolConfig(4096, 500, 5000, 5),    // Medium frames, medium delay
            new ProtocolConfig(8192, 1000, 10000, 7)   // Large frames, high delay
        };
        
        System.out.println("\nAvailable configurations:");
        for (int i = 0; i < configs.length; i++) {
            System.out.println((i + 1) + ". " + configs[i]);
        }
        System.out.print("Select configuration: ");
        int configChoice = scanner.nextInt() - 1;
        
        if (configChoice < 0 || configChoice >= configs.length) {
            System.out.println("Invalid configuration choice");
            return;
        }
        
        ProtocolConfig config = configs[configChoice];
        
        try {
            if (choice == 1) {
                startReceiver(config);
            } else if (choice == 2) {
                startSender(config, scanner);
            } else {
                System.out.println("Invalid choice");
            }
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            scanner.close();
        }
    }
    
    private static void startReceiver(ProtocolConfig config) throws IOException, ClassNotFoundException {
        Receiver receiver = new Receiver(PORT, config);
        try {
            System.out.println("Receiver is running. Waiting for data...");
            while (true) {
                long startTime = System.currentTimeMillis();
                String receivedData = receiver.start(); // Assuming start() returns received data
                long endTime = System.currentTimeMillis();

                if (receivedData.contains("DISCONNECT")) {
                    String[] parts = receivedData.split("DISCONNECT");
                    for (String frame : parts) {
                        if (!frame.isEmpty()) {
                            System.out.println("Received frame: " + frame);
                            System.out.println("Time to deliver frame: " + (endTime - startTime) + " ms");
                        }
                    }
                    System.out.println("DISCONNECT status received. Stopping receiver.");
                    break;
                } else {
                    System.out.println("Received frame: " + receivedData);
                    System.out.println("Time to deliver frame: " + (endTime - startTime) + " ms");
                }
            }
        } finally {
            receiver.close();
        }
    }

    private static void startSender(ProtocolConfig config, Scanner scanner) throws IOException, ClassNotFoundException {
        System.out.print("Enter receiver host (localhost): ");
        String host = scanner.nextLine();
        if (host.isEmpty()) host = "localhost";

        Sender sender = new Sender(host, PORT, config);
        try {
            while (true) {
                System.out.print("Enter data to send: ");
                String data = scanner.nextLine();

                if (data.isEmpty()) {
                    System.out.println("No data entered. Exiting sender.");
                    break; // Exit if no data is provided
                }

                sender.sendData(data.getBytes());

                System.out.print("Do you want to send more data or close the connection? (send/close): ");
                String choice = scanner.nextLine();

                if ("close".equalsIgnoreCase(choice)) {
                    sender.sendData("DISCONNECT".getBytes());
                    System.out.println("Connection closed.");
                    break;
                }
            }
        } finally {
            sender.close();
        }
    }
}