#include <stdio.h>
#include <string.h>

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
    char text[1000];
    FILE *fp;

  
    printf("Enter text (end input with a single line containing only 'END'):\n");

    fp = fopen("file.txt", "w");
    if (fp == NULL) {
        printf("Error: Could not create file.txt\n");
        return 1;
    }

    while (1) {
        fgets(text, sizeof(text), stdin);
        if (strcmp(text, "END\n") == 0) break;
        fputs(text, fp);
    }

    fclose(fp);

    // Step 2: Open file and analyze stats
    fp = fopen("file.txt", "r");
    if (fp == NULL) {
        printf("Error: Could not open file.txt\n");
        return 1;
    }

    FileStats fs = {0};
    countStats(fp, &fs);

    printf("\n--- File Statistics ---\n");
    printf("Chars:   %d\n", fs.chars);
    printf("Words:   %d\n", fs.words);
    printf("Spaces:  %d\n", fs.spaces);
    printf("Special: %d\n", fs.specials);
    printf("Lines:   %d\n", fs.lines);

    fclose(fp);
    return 0;
}
