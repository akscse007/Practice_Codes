#include <stdio.h>
#include <stdlib.h>
#include <time.h>


void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}


int partition(int A[], int p, int r) {
    int pivot = A[r]; // x=pivot 
    int i = p - 1;

    for (int j = p; j <= r - 1; j++) {
        if (A[j] <= pivot) {
            i++;
            swap(&A[i], &A[j]); 
        }
    }
    swap(&A[i + 1], &A[r]); 
    return i + 1;
}



void quicksort(int A[], int p, int r) {
    if (p < r) {
        int q = partition(A, p, r);
        quicksort(A, p, q - 1);
        quicksort(A, q + 1, r);
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
        A[i] = rand() % 100000;
    }

    printf("Randomly generated array:\n");
    printf("\n");
    printArray(A, size);
    printf("\n");

    quicksort(A, 0, size - 1);

    printf("Sorted array using Quicksort :  \n");
    printf("\n");
    printArray(A, size);

    return 0;
}
