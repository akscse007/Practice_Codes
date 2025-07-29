public class While_a {
    public static void main(String[] args){
        int[] numbers={1,2,3,4,5,6,7,8,9,10};
        int sum=0;
        int i=0;
        while(i< numbers.length){
            sum=sum+numbers[i];
            i++;
        }
        System.out.println("Sum is:  "+sum);
    }
}
