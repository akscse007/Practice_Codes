#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

typedef struct {
    double *d;
    int top;
    int size; // Added size to keep track of allocated memory
} Stack;

// Function to initialize the stack
void initStack(Stack *s, int size) {
    s->d = malloc(size * sizeof(double));
    if (!s->d) {
        printf("Memory allocation failed\n");
        exit(1);
    }
    s->top = 0;
    s->size = size;
}

// Function to push a value onto the stack, with overflow check
void push(Stack *s, double v) {
    if (s->top >= s->size) {
        // Handle stack overflow: reallocate with double the size
        s->size *= 2;
        s->d = realloc(s->d, s->size * sizeof(double));
        if (!s->d) {
            printf("Memory reallocation failed\n");
            exit(1);
        }
    }
    s->d[s->top++] = v;
}

// Function to pop a value from the stack
double pop(Stack *s) {
    if (s->top <= 0) {
        printf("Stack underflow\n");
        exit(1);
    }
    return s->d[--s->top];
}

// Function to peek the top value on the stack
double peek(Stack *s) {
    if (s->top <= 0) {
        return 0; // Or some other appropriate value to indicate empty
    }
    return s->d[s->top - 1];
}

// Function to check if the stack is empty
int isEmpty(Stack *s) {
    return s->top == 0;
}

// Function to get the precedence of an operator
int getPrecedence(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    if (op == '(') return 0; // Lowest precedence for parenthesis
    return -1; // For non-operators
}

double eval(char *expr) {
    Stack vals;
    Stack ops;
    initStack(&vals, 100); // Initial size of 100
    initStack(&ops, 100);  // Initial size of 100
    for (int i = 0; expr[i]; i++) {
        if (isspace(expr[i])) continue; // Skip spaces

        if (isdigit(expr[i])) {
            double num = 0;
            while (isdigit(expr[i])) {
                num = num * 10 + (expr[i] - '0');
                i++;
            }
            i--; // Correct the index after reading the number
            push(&vals, num);
        } else if (expr[i] == '(') {
            push(&ops, '(');
        } else if (expr[i] == ')') {
            while (peek(&ops) != '(') {
                double b = pop(&vals);
                double a = pop(&vals);
                char op = (char)pop(&ops);
                switch (op) {
                    case '+': push(&vals, a + b); break;
                    case '-': push(&vals, a - b); break;
                    case '*': push(&vals, a * b); break;
                    case '/':
                        if (b == 0) {
                            printf("Division by zero\n");
                            exit(1);
                        }
                        push(&vals, a / b);
                        break;
                }
            }
            pop(&ops); // Pop the '('
        } else if (expr[i] == '+' || expr[i] == '-' || expr[i] == '*' || expr[i] == '/') {
            int prec1 = getPrecedence(expr[i]);
            while (!isEmpty(&ops) && getPrecedence((char)peek(&ops)) >= prec1) {
                double b = pop(&vals);
                double a = pop(&vals);
                char op = (char)pop(&ops);
                switch (op) {
                    case '+': push(&vals, a + b); break;
                    case '-': push(&vals, a - b); break;
                    case '*': push(&vals, a * b); break;
                    case '/':
                        if (b == 0) {
                            printf("Division by zero\n");
                            exit(1);
                        }
                        push(&vals, a / b);
                        break;
                }
            }
            push(&ops, expr[i]);
        }
    }

    while (!isEmpty(&ops)) {
        double b = pop(&vals);
        double a = pop(&vals);
        char op = (char)pop(&ops);
        switch (op) {
            case '+': push(&vals, a + b); break;
            case '-': push(&vals, a - b); break;
            case '*': push(&vals, a * b); break;
            case '/':
                if (b == 0) {
                    printf("Division by zero\n");
                    exit(1);
                }
                push(&vals, a / b);
                break;
        }
    }
    double result = pop(&vals);
    free(vals.d);
    free(ops.d);
    return result;
}

int main() {
    char expression[100];
    printf("Enter an arithmetic expression: ");
    fgets(expression, sizeof(expression), stdin);
    // Remove trailing newline character from fgets
    expression[strcspn(expression, "\n")] = 0;
    printf("Result: %.2f\n", eval(expression));
    return 0;
}

