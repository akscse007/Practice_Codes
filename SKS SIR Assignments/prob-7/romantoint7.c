#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

int romanToInt(char *s) {
    int val[256] = {['I']=1, ['V']=5, ['X']=10, ['L']=50, ['C']=100, ['D']=500, ['M']=1000};
    int res = 0, prev = 0;
    for (int i = strlen(s)-1; i >= 0; i--) {
        int curr = val[(int)s[i]];
        if(s[i] < 'A' || s[i] > 'Z'){
            return -1;
        }
        res += curr < prev ? -curr : curr;
        prev = curr;
    }
    return res;
}

void intToRoman(int num, char *res) {
    if (num <= 0) {
        strcpy(res, "Invalid Input");
        return;
    }
    int val[] = {1000,900,500,400,100,90,50,40,10,9,5,4,1};
    char *sym[] = {"M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"};
    res[0] = '\0';
    for (int i = 0; num > 0; i++) {
        while (num >= val[i]) {
            strcat(res, sym[i]);
            num -= val[i];
        }
    }
}

int main() {
    char roman[20];
    int number, choice, result;

    while(1){
        printf("\nRoman Numeral Converter Menu\n");
        printf("1. Roman to Integer\n");
        printf("2. Integer to Roman\n");
        printf("3. Exit\n");
        printf("Enter your choice: ");
        if (scanf("%d", &choice) != 1) {
            printf("Invalid input. Exiting.\n");
            break;
        }

        switch (choice) {
            case 1:
                printf("Enter Roman Numeral: ");
                if (scanf("%19s", roman) != 1) {
                    printf("Invalid input.\n");
                    break;
                }
                for(int i = 0; i < strlen(roman); i++){
                    roman[i] = toupper(roman[i]);
                }
                result = romanToInt(roman);
                if(result == -1){
                    printf("Invalid Roman Numeral\n");
                }
                else{
                    printf("%s -> %d\n", roman, result);
                }

                break;
            case 2:
                printf("Enter Integer: ");
                if (scanf("%d", &number) != 1) {
                    printf("Invalid input.\n");
                    break;
                }
                intToRoman(number, roman);
                printf("%d -> %s\n", number, roman);
                break;
            case 3:
                return 0;
            default:
                printf("Invalid choice.\n");
        }
    }
    return 0;
}

