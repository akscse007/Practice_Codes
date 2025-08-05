#include <stdio.h>

typedef struct {
    int chars, words, spaces, specials, lines;
} FileStats;

void countStats(FILE *file, FileStats *s) {
    char c;
    int inword = 0;
    while ((c = fgetc(file)) != EOF) {
        s->chars++;
        if (c == '\n') s->lines++;
        if (c == ' ') {
            s->spaces++;
            inword = 0;
        } else if ((c >= 'a' && c <= 'z') ||
                   (c >= 'A' && c <= 'Z') ||
                   (c >= '0' && c <= '9')) {
            if (!inword) {
                s->words++;
                inword = 1;
            }
        } else {
            s->specials++;
            inword = 0;
        }
    }
}

int main() {
    FILE *fp = fopen("file.txt", "r");

    // Check if file was opened successfully
    if (fp == NULL) {
        printf("Error: Could not open file.txt\n");
        return 1; // Exit with error
    }

    FileStats fs = {0};
    countStats(fp, &fs);

    printf("Chars: %d\nWords: %d\nSpaces: %d\nSpecial: %d\nLines: %d\n",
           fs.chars, fs.words, fs.spaces, fs.specials, fs.lines);

    fclose(fp);
    return 0;
}
