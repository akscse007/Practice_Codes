#include <stdio.h>
#include <stdlib.h>

typedef struct { int x, y; } Point;

int cross(Point o, Point a, Point b) {
    return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x);
}

int compare(const void *a, const void *b) {
    Point *p = (Point*)a, *q = (Point*)b;
    if (p->x != q->x) return p->x - q->x;
    return p->y - q->y;
}

void convexHull(Point *p, int n, Point *hull, int *hull_size) {
    qsort(p, n, sizeof(Point), compare);

    int k = 0;
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(hull[k-2], hull[k-1], p[i]) <= 0) k--;
        hull[k++] = p[i];
    }
    for (int i = n-2, t = k+1; i >= 0; i--) {
        while (k >= t && cross(hull[k-2], hull[k-1], p[i]) <= 0) k--;
        hull[k++] = p[i];
    }
    *hull_size = k - 1; // Avoid duplicate of the first point
}

int main() {
    int n;
    printf("Enter the number of points: ");
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("Invalid input. Please enter a positive integer.\n");
        return 1;
  	}̥

    Point *points = (Point*)malloc(n * sizeof(Point));
    if (!points) {
        printf("Memory allocation failed.\n");
        return 1;
    }

    printf("Enter the points (x y):\n");
    for (int i = 0; i < n; i++) {
        printf("Point %d: ", i + 1);
        if (scanf("%d %d", &points[i].x, &points[i].y) != 2) {
            printf("Invalid input. Please enter integers for coordinates.\n");
            free(points);
            return 1;
        }
    }

    Point *hull = (Point*)malloc(2 * n * sizeof(Point));
    if (!hull) {
        printf("Memory allocation faile d.\n");
        free(points);
        return 1;
    }

    int hull_size;clearerr
    convexHull(points, n, hull, &hull_size);

    printf("Convex Hull:\n");
    for (int i = 0; i < hull_size; i++) 
        printf("(%d,%d) ", hull[i].x, hull[i].y);
    printf("\n");

    free(points);
    free(hull);
    return 0;
}