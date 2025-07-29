import java.util.Scanner;

class Sequential_Search{
    public static int getTarget(int arr[],int target) {
        int i = 0;
        for (i = 0; i < arr.length; i++) {
            if (target == arr[ i]	)
            return i+1;
        }
        return -1;

    }
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter the number of elements: ");
        int size=sc.nextInt();

        int[]arr=new int [size];

        System.out.println("ENTER THE ELEMEMTS..... ");

        for(int i=0;i<size;i++){
            System.out.println("ENTER THE ELEMEMT " +(i+1)+ " ");
            arr[i]=sc.nextInt();
        }
        // Display
        System.out.println("\nArray elements:");
        for (int i = 0;i < size; i++) {
            System.out.print(arr[i] + " ");
        }


        System.out.println("\nEnter the target integer");
        int target= sc.nextInt();

        System.out.println("got the target Array position " +getTarget(arr,target));
        sc.close();
    }




}





