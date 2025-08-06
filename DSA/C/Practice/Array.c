#include<stdio.h>
#include<stdlib.h>
#include<time.h>
#include<math.h>

void printArr(int A[],int size){
	for(int i=0;i<size;i++){
		printf(" %d ",A[i]);
	}
	printf("\n");
}
void insert(int A[],int n,int k,int element){
	


}




int main(){
	int size;
	srand(time(NULL));
	printf("Enter the size of the array: ");
	scanf("%d",&size);
	int A[size];
	for(int i=0;i<size;i++){
		A[i]= rand() % 100;
	}
	printf("Randomly generated Array: \n");
	printArr(A,size);
	
}
