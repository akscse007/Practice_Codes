#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node* create(int data) {
    Node *n = malloc(sizeof(Node));
    if (!n) {
        printf("Memory allocation error\n");
        exit(1);
    }
    n->data = data;
    n->next = n;
    return n;
}

void insert(Node **head, int data) {
    Node *n = create(data);
    if (!*head) *head = n;
    else {
        Node *tmp = *head;
        while (tmp->next != *head)
            tmp = tmp->next;
        tmp->next = n;
        n->next = *head;
    }
}

void deleteNode(Node **head, int data) {
    if (!*head) return;
    Node *curr = *head, *prev = NULL;
    do {
        if (curr->data == data) {
            if (prev) prev->next = curr->next;
            else *head = curr->next;
            free(curr);
            return;
        }
        prev = curr;
        curr = curr->next;
    } while (curr != *head);
    printf("Node with data %d not found\n", data);
}

void printList(Node *head) {
    if (!head) {
        printf("List is empty\n");
        return;
    }
    Node *tmp = head;
    do {
        printf("%d ", tmp->data);
        tmp = tmp->next;
    } while (tmp != head);
    printf("\n");
}

void freeList(Node **head) {
    if (!*head) return;
    Node *curr = *head, *next;
    do {
        next = curr->next;
        free(curr);
        curr = next;
    } while (curr != *head);
    *head = NULL;
}

int main() {
    Node *head = NULL;
    int choice, data;

    while (1) {
        printf("\nCircular Linked List Menu\n");
        printf("1. Insert Node\n");
        printf("2. Delete Node\n");
        printf("3. Print List\n");
        printf("4. Exit\n");
        printf("Enter your choice: ");
        if (scanf("%d", &choice) != 1) {
            printf("Invalid input.  Exiting.\n");
            break;
        }

        switch (choice) {
            case 1:
                printf("Enter data to insert: ");
                if (scanf("%d", &data) != 1) {
                    printf("Invalid input.\n");
                    break;
                }
                insert(&head, data);
                break;
            case 2:
                printf("Enter data to delete: ");
                if (scanf("%d", &data) != 1) {
                    printf("Invalid input.\n");
                    break;
                }
                deleteNode(&head, data);
                break;
            case 3:
                printList(head);
                break;
            case 4:
                freeList(&head);
                return 0;
            default:
                printf("Invalid choice\n");
        }
    }
    freeList(&head);
    return 0;
}

