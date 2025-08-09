/* Write a program to implement the array the operations. You have 
an array arr, the maximum size of the array is size and the number 
of elements in the array is n. The operations include:
1. Traversing the array and printing the elements of the array. 
If the array is empty an appropriate message should be 
displayed.
2. Inserting an element in the array at position k. If the array is 
full an appropriate message should be displayed. Also, it 
should be checked if k is larger than the maximum possible 
size of the array.
3. Deleting an element in the array from position k. If the array 
is empty an appropriate message should be displayed. Also, 
it should be checked if k is larger than the maximum possible 
size of the array.
4. Search for an element in the array. If it is found the position
of the element is to be displayed, else an appropriate 
message is to be displayed if the element is not present in
the array
*/



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
void insert(int A[],int *size,int pos,int element){
   if(pos>=*size+1||pos<=0){
   printf("Invalid Operation\n");
   }
   else{
   for(int i=*size-1;i>=pos;i--){
        A[i+1]=A[i];
    }
    A[pos-1]=element;
    (*size)++;
    printArr(A,*size);
   }
   
   
    
}

void deletion(int A[],int *size,int pos){
    if(pos<=0||pos>=*size+1){
    printf("Invalid operation....\n");
    }
    else{
    int item=A[pos-1];
    for(int i=pos-1;i<*size-1;i++){
        A[i]=A[i+1];
    }
    (*size)--; 
    printArr(A,*size);
    }
    
}    
void searchArr(int A[],int *size,int element){
     
    for(int i=0;i<*size;i++){
        if(A[i]==element){
            printf("Found the element at position %d in te array\n",i+1);
        }
    }
    printf("Element not Found at any position in the array\n");
}

int main(){
//generating Arrray Randomly 
        int size;
        srand(time(NULL));
        printf("Enter the size of the array: \n");
        scanf("%d",&size);
        int A[size];
        for(int i=0;i<size;i++){
                A[i]= rand() % 100;
        }
        printf("Randomly generated Array: \n");
        printArr(A,size);
        
        
        //Insertion at any position 
        int element,pos;
        printf("Enter the element to be added: \n");
        scanf("%d",&element);
        printf("Enter the position where the element to be added: \n");
        scanf("%d",&pos);
        insert(A,&size,pos,element);
        
        // deletion of element
        printf("Enter the position where the element to be deleted: \n");
        scanf("%d",&pos);
        deletion(A,&size,pos);
        
        // search of element
        printf("Enter the element to be searched: \n");
        scanf("%d",&element);
        searchArr(A,&size,element);
}