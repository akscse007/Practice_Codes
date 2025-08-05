#include <stdio.h>
#include <string.h>

// Function to find the maximum of two numbers
int max(int a, int b) {
    if (a > b)
        return a;
    else
        return b;
}

int main() {
    char str1[100], str2[100];
    int dp[100][100];
    int i, j;

    // Take input from the user
    printf("Enter first string: ");
    fgets(str1, sizeof(str1), stdin);
    str1[strcspn(str1, "\n")] = '\0';  // Remove newline

    printf("Enter second string: ");
    fgets(str2, sizeof(str2), stdin);
    str2[strcspn(str2, "\n")] = '\0';  // Remove newline

    int m = strlen(str1);
    int n = strlen(str2);

    // Initialize dp array
    for (i = 0; i <= m; i++) {
        for (j = 0; j <= n; j++) {
            if (i == 0 || j == 0)
                dp[i][j] = 0;
            else if (str1[i - 1] == str2[j - 1])
                dp[i][j] = dp[i - 1][j - 1] + 1;
            else
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }

    // Build the LCS string from dp table
    int index = dp[m][n];
    char lcsResult[100];
    lcsResult[index] = '\0';  // End of string

    i = m;
    j = n;
    while (i > 0 && j > 0) {
        if (str1[i - 1] == str2[j - 1]) {
            lcsResult[index - 1] = str1[i - 1];
            i--;
            j--;
            index--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    printf("Longest Common Subsequence: %s\n", lcsResult);

    return 0;
}