#include <stdio.h>
#include <stdlib.h>
#include <string.h> // For strcmp and strdup

typedef struct {
    char **words;
    int count;
} WordList;

// Function to extract words from the file
void extractWords(FILE *file, WordList *wl) {
    char buf[100000];
    int c, idx = 0;
    wl->count = 0;
    wl->words = NULL;

    while ((c = fgetc(file)) != EOF) {
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
            buf[idx++] = c; // Add character to the buffer
        } else if (idx > 0) {
            buf[idx] = '\0'; // Null-terminate the word
            wl->words = realloc(wl->words, (wl->count + 1) * sizeof(char *));
            if (wl->words == NULL) {
                printf("Memory allocation failed\n");
                exit(1);
            }
            wl->words[wl->count++] = strdup(buf); // Add the word to the list
            idx = 0; // Reset the buffer index
        }
    }

    // Handle the last word if the file ends without a delimiter
    if (idx > 0) {
        buf[idx] = '\0';
        wl->words = realloc(wl->words, (wl->count + 1) * sizeof(char *));
        if (wl->words == NULL) {
            printf("Memory allocation failed\n");
            exit(1);
        }
        wl->words[wl->count++] = strdup(buf);
    }
}

// Function to sort words lexicographically
void sortWords(WordList *wl) {
    for (int i = 0; i < wl->count - 1; i++) {
        for (int j = i + 1; j < wl->count; j++) {
            if (strcmp(wl->words[i], wl->words[j]) > 0) {
                char *temp = wl->words[i];
                wl->words[i] = wl->words[j];
                wl->words[j] = temp;
            }
        }
    }
}

// Function to free allocated memory
void freeWords(WordList *wl) {
    for (int i = 0; i < wl->count; i++) {
        free(wl->words[i]);
    }
    free(wl->words);
}

int main() {
    // Open the file
    FILE *fp = fopen("e:\\B.Tech\\SKS SIR\\prob-2\\file.txt", "r");
    if (fp == NULL) {
        printf("Error: Could not open file.txt\n");
        return 1;
    }

    WordList wl;
    extractWords(fp, &wl); // Extract words from the file
    fclose(fp); // Close the file

    // Check if any words were found
    if (wl.count == 0) {
        printf("No words found in the file.\n");
        return 0;
    }

    sortWords(&wl); // Sort the words

    // Print the sorted words
    printf("Sorted words:\n");
    for (int i = 0; i < wl.count; i++) {
        printf("%s\n", wl.words[i]);
    }

    freeWords(&wl); // Free allocated memory
    return 0;
}
