#include <stdio.h>

#define BLOCK 100

void multiply(FILE *a, FILE *b, FILE *res, int size) {
    double bufA[BLOCK][BLOCK], bufB[BLOCK][BLOCK], tmp[BLOCK][BLOCK] = {0};
    for (int i = 0; i < size; i += BLOCK)
        for (int j = 0; j < size; j += BLOCK)
            for (int k = 0; k < size; k += BLOCK) {
                // Read blocks from files into bufA and bufB
                for (int x = 0; x < BLOCK; x++)
                    for (int y = 0; y < BLOCK; y++)
                        for (int z = 0; z < BLOCK; z++)
                            tmp[x][y] += bufA[x][z] * bufB[z][y];
                // Write tmp to res file
            }
}

int main() {
    FILE *a = fopen("A.bin", "r"), *b = fopen("B.bin", "r"), *res = fopen("C.bin", "w");
    multiply(a, b, res, 10000); // Assuming 10,000x10,000 matrices
    fclose(a); fclose(b); fclose(res);
}