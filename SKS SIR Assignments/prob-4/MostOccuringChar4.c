#include <stdio.h>

void mostFrequent(FILE *file) {
    int count[256] = {0}; // Array to store character frequencies
    char c;

    // Count the frequency of each character
    while ((c = fgetc(file)) != EOF) {
        count[(unsigned char)c]++;
    }

    // Find the character with the maximum frequency
    int max = 0;
    char max_char = '\0';
    for (int i = 0; i < 256; i++) {
        if (count[i] > max) {
            max = count[i];
            max_char = i;
        }
    }

    // Print the result
    if (max > 0) {
        printf("'%c' appears %d times\n", max_char, max);
    } else {
        printf("The file is empty or contains no valid characters.\n");
    }
}

int main() {
    FILE *fp = fopen("file.txt", "r");

    // Check if the file was opened successfully
    if (fp == NULL) {
        printf("Error: Could not open file.\n");
        return 1;
    }

    // Call the function to find the most frequent character
    mostFrequent(fp);

    // Close the file
    fclose(fp);

    return 0;
}