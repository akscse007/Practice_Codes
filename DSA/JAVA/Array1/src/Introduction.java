
public	class	Introduction {
    public static void main(String[] args) {
        arrayExample();
    }

    public static void arrayExample(){
        int[] arr = new int[1099];
        for (int i = 0; i < 1099; i++){
            arr[i] = i;
        }
        printArray(arr, 1099);
    }
    public	static	void	printArray(int	arr[],	int	count) {
        System.out.println("Values	stored	in	array	are	:	");
        for	(int i=0;i<count;i++) {
            System.out.println(" "+arr[i]);
        }
    }
}
