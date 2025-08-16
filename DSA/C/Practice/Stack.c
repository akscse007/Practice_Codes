/* Implement a stack data structure, which follows a Last In First Out (LIFO) Policy using an array.
Suppose the name of the array is arr, the topmost element of the stack is pointed by a variable 
called top and the size of the stack is denoted by max_size. 
Perform the following operations: 
1. Push(x): push an element x into the stack. Display an 
appropriate message if the stack is full. 
2. Pop(): pop the topmost element from the stack. Display an 
appropriate message if the stack is empty. 
3. Display(): Print all the elements of the stack from, starting 
from the topmost element. 
*/

#include<stdio.h>
#include<stdlib.h>  
#define MAX_SIZE 50

typedef struct {
    int arr[MAX_SIZE];
    int top;
    int max_size;
}Stack;


//intitalize stack
void intializeStack(Stack *s){
    s->top = -1;//-1implies the stack is  empty
    s->max_size = MAX_SIZE;
}

//Function to impliment Push operation
void push(Stack *s, int x) {
    if (s->top == s->max_size - 1) {
        printf("Stack is full.....\n");//full stack condition.
    } else {
        s->top++;//incrimenting top position
        s->arr[s->top] = x;//adding element to the stack array at top position
        printf("Element %d pushed to the stack..\n", x);
    }
}

//Function to impliment Pop operation
void pop(Stack *s) {
    if (s->top == -1) {
        printf("Stack is Empty.....\n");//-1 indicates the empty stack
    } else {
        printf("%d popped from the stack..\n", s->arr[(s->top)--]);
    }
}
//Function to display the stack
void disp(Stack *s) {
    if (s->top == -1) {
        printf("Stack is empty....\n");//emptiness  
    } else {
        printf("Stack elements are (Top to Bottom...): \n");//top to bottom approach
        for (int i = s->top; i >= 0; i--) {//traversing from the top to the 0th element
            printf("%d ", s->arr[i]);
        }
        printf("\n");
    }
}

int main() {
    Stack myStack;
    intializeStack(&myStack);
    int choice, x;
    printf("Stack Operations...\n");
    printf("1.Push..\n");
    printf("2.Pop..\n");
    printf("3.Display..\n");
    printf("4.Exit..\n");

    while (1) {
        printf("Enter the choice....\n");
        scanf("%d", &choice);

        switch (choice) {
            case 1:
                printf("Enter the element to be pushed...");
                scanf("%d", &x);
                push(&myStack, x);
                break;
            case 2:
                pop(&myStack);
                break;
            case 3:
                disp(&myStack);
                break;
            case 4:
                printf("Exiting the programme.....\n");
                exit(0);
            default:
                printf("Invalid choice. Please try again.\n");
        }
    }
    return 0;
}