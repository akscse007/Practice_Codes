#include <stdio.h>
#include <string.h>
#include <stdlib.h> 

const char *ones[] = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"};
const char *teens[] = {"Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
const char *tens[] = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
const char *scales[] = {"", " Thousand", " Million", " Billion"};

void convertLessThanThousand(int num, char *res) {
    if (num >= 100) {
        strcat(res, ones[num / 100]);
        strcat(res, " Hundred");
        num %= 100;
        if (num > 0) {
            strcat(res, " ");
        }
    }

    if (num >= 20) {
        strcat(res, tens[num / 10]);
        if (num % 10 != 0) {
            strcat(res, " ");
            strcat(res, ones[num % 10]);
        }
    } else if (num >= 10) {
        strcat(res, teens[num - 10]);
    } else if (num > 0) {
        strcat(res, ones[num]);
    }
}

void numToWords(long long n, char *res) {
    if (n == 0) {
        strcpy(res, "Zero");
        return;
    }

    char tempResult[1000] = "";
    int scaleIndex = 0;

    while (n > 0) {
        int part = n % 1000;
        n /= 1000;

        char partStr[100] = "";
        convertLessThanThousand(part, partStr);

        if (part != 0) {
            if (tempResult[0] != '\0') {
                char temp[1000];
                strcpy(temp, partStr);
                strcat(temp, scales[scaleIndex]);
                strcat(temp, " ");
                strcat(temp, tempResult);
                strcpy(tempResult, temp);
            } else {
                strcpy(tempResult, partStr);
                strcat(tempResult, scales[scaleIndex]);
            }
        }
        scaleIndex++;
    }

    strcpy(res, tempResult);
}

int main() {
    char input[100];
    char result[1000];
    long long number;
    char *endptr; // For error checking with strtoll

    printf("Enter a non-negative integer: ");
    if (fgets(input, sizeof(input), stdin) != NULL) {
        // Remove trailing newline character if present
        input[strcspn(input, "\n")] = 0;

        // Convert the input string to a long long integer
        number = strtoll(input, &endptr, 10);

        // Check for errors during conversion
        if (*endptr != '\0' || number < 0) {
            printf("Invalid input. Please enter a non-negative integer.\n");
        } else {
            numToWords(number, result);
            printf("%lld in words: %s\n", number, result);
        }
    } else {
        printf("Error reading input.\n");
    }

    return 0;
}