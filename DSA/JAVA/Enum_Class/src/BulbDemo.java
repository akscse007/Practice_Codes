public class BulbDemo {
    public static void main(String [] args){
        Bulb r = new Bulb();
        Bulb m = new Bulb();
        r.size=Bulb.BulbSize.Small;
        m.size=Bulb.BulbSize.Large;
        System.out.println("BulbSize 1: "+r.size);
        System.out.println("BulbSize2 : "+m.size);
    }
}
