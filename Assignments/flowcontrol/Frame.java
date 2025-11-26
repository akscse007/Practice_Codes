import java.io.Serializable;
import java.util.Arrays;

public class Frame implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private int sequenceNumber;
    private byte[] data;
    private boolean isAck;
    private boolean isNak;
    
    public Frame(int sequenceNumber, byte[] data) {
        this.sequenceNumber = sequenceNumber;
        this.data = data != null ? Arrays.copyOf(data, data.length) : new byte[0];
        this.isAck = false;
        this.isNak = false;
    }
    
    // ACK frame constructor
    public Frame(int sequenceNumber, boolean isAck) {
        this.sequenceNumber = sequenceNumber;
        this.data = new byte[0];
        this.isAck = isAck;
        this.isNak = !isAck;
    }
    
    // Getters and setters
    public int getSequenceNumber() { return sequenceNumber; }
    public byte[] getData() { return Arrays.copyOf(data, data.length); }
    public boolean isAck() { return isAck; }
    public boolean isNak() { return isNak; }
    public int getSize() { return data.length; }
    
    @Override
    public String toString() {
        if (isAck) return "ACK[" + sequenceNumber + "]";
        if (isNak) return "NAK[" + sequenceNumber + "]";
        return "DATA[" + sequenceNumber + ", size=" + data.length + " bytes]";
    }
}