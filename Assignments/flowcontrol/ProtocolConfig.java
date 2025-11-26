public class ProtocolConfig {
    private int frameSize;
    private int propagationDelay;
    private int timeout;
    private int maxRetransmissions;
    
    public ProtocolConfig(int frameSize, int propagationDelay, int timeout, int maxRetransmissions) {
        this.frameSize = frameSize;
        this.propagationDelay = propagationDelay;
        this.timeout = timeout;
        this.maxRetransmissions = maxRetransmissions;
    }
    
    // Getters
    public int getFrameSize() { return frameSize; }
    public int getPropagationDelay() { return propagationDelay; }
    public int getTimeout() { return timeout; }
    public int getMaxRetransmissions() { return maxRetransmissions; }
    
    @Override
    public String toString() {
        return String.format("ProtocolConfig[FrameSize=%d, PropDelay=%dms, Timeout=%dms, MaxRetries=%d]",
                frameSize, propagationDelay, timeout, maxRetransmissions);
    }
}