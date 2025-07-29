#include<stdio.h>
#include<stdlib.h>
#include<time.h>
#include<math.h>



void merge(int A[], int p, int q, int r) {
    int n1 = q - p + 1;
    int n2 = r - q;

    int L[n1 + 1], R[n2 + 1];

    
    for (int i = 0; i < n1; i++)
        L[i] = A[p + i];
        
    for (int j = 0; j < n2; j++)
        R[j] = A[q + 1 + j];
    
    
    L[n1] = INT_MAX;
    R[n2] = INT_MAX;

    int i = 0, j = 0;
    
    
    for (int k = p; k <= r; k++) {
        if (L[i] <= R[j]) {
            A[k] = L[i];
            i++;         
        } 
		else {
            A[k] = R[j];
            j++;
        }
    }
}

void mergeSort(int A[], int p, int r) {
    if (p < r) {
        int q = floor((p + r) / 2);
      
        mergeSort(A, p, q);
        mergeSort(A, q + 1, r);
        merge(A, p, q, r);
    }
}



void printArray(int A[], int size) {
    for (int i = 0; i < size; i++) {
        printf("%d ", A[i]);
    }
    printf(" \n");
}

int main() {
    int size;

   
    srand(time(NULL));

    printf("Enter the size of the array: ");
    scanf("%d", &size);

    int A[size];

    
    for (int i = 0; i < size; i++) {
        A[i] = rand() % 10000;
    }

    printf("Randomly generated array:  \n");
    printf(" \n");
    printArray(A, size);
    printf(" \n");

    mergeSort(A, 0, size - 1);

    printf("\nSorted array using MergeSort :  \n");
    printf(" \n");
    printArray(A, size);

    return 0;
}


