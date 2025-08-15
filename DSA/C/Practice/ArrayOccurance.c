/* Write a program to calculate the number of times each 
element occurs in the array. Suppose the name of the array is arr, 
the maximum size of the array is size, and the number of elements 
present in the array is n. For example, if the array arr = 
[1,1,1,2,2,3,4,4,4] the output should be like 1 occurs 3 times, 2 
occurs 2 times, 3 occurs 1 time, and 4 occurs 3 times. */



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

void Occurrance(int A[],int size){
    int count[size];
    for(int i=0;i<size;i++){
        count[i] = 1; // Each element occurs at least once
    }
    for(int i=0;i<size;i++){
        if(A[i] == -1) continue; // Already counted
        for(int j=i+1;j<size;j++){
            if(A[i] == A[j]){
                count[i]++;
                A[j] = -1; // Mark as counted
            }
        }
    }
    for(int i=0;i<size;i++){
        if(A[i] != -1){
            printf("%d occurs %d times\n", A[i], count[i]);
        }
    }
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
    Occurrance(A, size);
    
}


