public class ProtocolTest {
    public static void main(String[] args) {
        // Test different configurations
        ProtocolConfig[] testConfigs = {
            new ProtocolConfig(512, 50, 1000, 3),   // Fast network, small frames
            new ProtocolConfig(2048, 200, 3000, 4), // Medium network
            new ProtocolConfig(4096, 500, 5000, 5)  // Slow network, large frames
        };
        
        for (ProtocolConfig config : testConfigs) {
            System.out.println("\n=== Testing with " + config + " ===");
            testProtocol(config);
        }
    }
    
    private static void testProtocol(ProtocolConfig config) {
        // This would typically involve starting receiver and sender in separate threads
        // For demonstration, we'll just show the configuration
        System.out.println("Frame size: " + config.getFrameSize() + " bytes");
        System.out.println("Propagation delay: " + config.getPropagationDelay() + "ms");
        System.out.println("Timeout: " + config.getTimeout() + "ms");
        System.out.println("Max retransmissions: " + config.getMaxRetransmissions());
        
        // Calculate theoretical efficiency
        double transmissionTime = (config.getFrameSize() * 8.0) / 1000000; // Assuming 1Mbps
        double efficiency = transmissionTime / (transmissionTime + 2 * config.getPropagationDelay() / 1000.0);
        System.out.printf("Theoretical efficiency: %.2f%%\n", efficiency * 100);
    }
}