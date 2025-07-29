import java.util.*;
public class Sum_Call {

    public static int SumArray(int arr[]) {
        int size = arr.length;
        int total = 0;
        int index = 0;
        for (index = 0; index < size; index++)
            total = total + arr[index];
        return total;
    }

    //UDer Defined Arr

        public static void main(String[] args) {
            Scanner sc = new Scanner(System.in);

            // Get array size from user
            System.out.print("Enter the size of the array: ");
            int size = sc.nextInt();

            // Create array with specified size
            int[] arr = new int[size];

            // Get array elements from user
            System.out.println("Enter " + size + " elements:");
            for (int index = 0; index < size; index++) {
                System.out.print("Element " + (index + 1) + ": ");
                arr[index] = sc.nextInt();
            }

            // Display
            System.out.println("\nArray elements:");
            for (int index = 0; index < size; index++) {
                System.out.print(arr[index] + " ");
            }

            sc.close();


            //Sum
            System.out.println("\nsum	of	all	the	values	in	array: " + SumArray(arr));



    }
}