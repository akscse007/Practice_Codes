import java.util.Scanner;

class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter Name: ");
        String name = sc.nextLine();
        System.out.println("Enter Grade: ");
        char grade = sc.next().charAt(0);
        System.out.println("Enter Marks: ");
        double marks = sc.nextDouble();


             if(grade=='A' && marks>=90) {
            System.out.println(name+ " promoted to the next class with exellent learning with grade " + grade);
             }
            else if(grade=='B' && marks>=75){
                System.out.println(name+ " promoted to the next class with great learning with grade " +grade);
            }
            else if(grade=='C' && marks>=50){
                System.out.println(name+ " promoted to the next class with normal learning with grade " +grade);
            }
            else if(grade=='D' && marks>= 35){
                System.out.println(name+ " promoted to the next class with poor with grade " +grade);
            }
            else{
                System.out.println(name+ " "+grade+ " not Promoted to the next class or grade is wrong" );

            }

    }
}