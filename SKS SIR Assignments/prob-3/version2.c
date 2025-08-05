#include <stdio.h>
#include <stdlib.h>

// Structure to hold a point's x and y coordinates
typedef struct {
    int x;
    int y;
} Point;

// Function to calculate the cross product of two vectors
// This helps determine if a point is to the left or right of a line
int cross_product(Point o, Point a, Point b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// Function to compare two points for sorting
// Sort points by x-coordinate, then by y-coordinate if x-coordinates are equal
int compare_points(const void *a, const void *b) {
    Point *p1 = (Point *)a;
    Point *p2 = (Point *)b;
    if (p1->x != p2->x) {
        return p1->x - p2->x;
    } else {
        return p1->y - p2->y;
    }
}

// Function to compute the convex hull of a set of points
// p: Array of input points
// n: Number of input points
// hull: Array to store the points on the convex hull
// hull_size: Pointer to an integer to store the number of points in the hull
void convexHull(Point *p, int n, Point *hull, int *hull_size) {
    // 1. Sort the points
    qsort(p, n, sizeof(Point), compare_points);

    // 2. Initialize the hull array and the hull size
    int k = 0; // k will hold the number of points in the hull
    // The hull can have at most 2*n points in the worst case, but will have less.
    // We allocate the maximum possible to avoid reallocating.

    // 3. Build the lower hull
    for (int i = 0; i < n; i++) {
        // Remove points that make a right turn or are collinear
        while (k >= 2 && cross_product(hull[k - 2], hull[k - 1], p[i]) <= 0) {
            k--; // Remove the last point from the hull
        }
        hull[k++] = p[i]; // Add the current point to the hull
    }

    // 4. Build the upper hull
    for (int i = n - 2, t = k + 1; i >= 0; i--) {
        // Remove points that make a right turn or are collinear
        while (k >= t && cross_product(hull[k - 2], hull[k - 1], p[i]) <= 0) {
            k--;
        }
        hull[k++] = p[i];
    }

    // 5. Set the hull size, excluding the duplicate start point
    *hull_size = k - 1;
}

int main() {
    int n; // Number of points
    printf("Enter the number of points: ");
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("Invalid input. Please enter a positive integer.\n");
        return 1; // Return an error code
    }

    // Dynamically allocate memory for the points array
    Point *points = (Point *)malloc(n * sizeof(Point));
    if (points == NULL) {
        printf("Memory allocation failed.\n");
        return 1; // Return an error code
    }

    // Read the points from the user
    printf("Enter the points (x y):\n");
    for (int i = 0; i < n; i++) {
        printf("Point %d: ", i + 1);
        if (scanf("%d %d", &points[i].x, &points[i].y) != 2) {
            printf("Invalid input. Please enter integers for coordinates.\n");
            free(points); // Free allocated memory before returning
            return 1; // Return an error code
        }
    }

    // Dynamically allocate memory for the hull array.  The hull will have at most 2*n points.
    Point *hull = (Point *)malloc(2 * n * sizeof(Point));
    if (hull == NULL) {
        printf("Memory allocation failed.\n");
        free(points); // Free the other allocated memory
        return 1; // Return an error code
    }

    int hull_size; // Variable to store the size of the convex hull
    convexHull(points, n, hull, &hull_size); // Compute the convex hull

    // Print the convex hull points
    printf("Convex Hull Points:\n");
    for (int i = 0; i < hull_size; i++) {
        printf("(%d, %d)", hull[i].x, hull[i].y);
        if (i < hull_size - 1) {
            printf(", "); // Add comma and space, except after the last point
        }
    }
    printf("\n");

    // Free the dynamically allocated memory
    free(points);
    free(hull);
    return 0; // Return success code
}

