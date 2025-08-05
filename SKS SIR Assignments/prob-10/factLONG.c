#include <stdio.h>
#include <stdlib.h>

typedef struct { int *d; int len; } BigInt;

BigInt multiply(BigInt a, int b) {
    BigInt res = {calloc(a.len + 10, sizeof(int)), a.len + 10};
    int carry = 0;
    for (int i = 0; i < a.len; i++) {
        int prod = a.d[i] * b + carry;
        res.d[i] = prod % 10;
        carry = prod / 10;
    }
    while (carry) { res.d[res.len++] = carry % 10; carry /= 10; }
    return res;
}

void printFactorial(int n) {
    BigInt result = {malloc(sizeof(int)), 1};
    result.d[0] = 1;
    for (int i = 2; i <= n; i++) {
        BigInt tmp = multiply(result, i);
        free(result.d);
        result = tmp;
    }
    for (int i = result.len-1; i >= 0; i--) printf("%d", result.d[i]);
}

int main() {
	int m;
	printf("Enter the number to get factorial:  \n");
	scanf("%d",&m);
	printf("The factorial is :   \n");
	printFactorial(m);
}