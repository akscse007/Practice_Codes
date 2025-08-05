#include<stdio.h>
#include<stdbool.h>

bool cheekPrime(int num){
	if(num<=1){
		return false;
	}
	if(num==2){
		return true;
	}
	if(num%2==0){
		return false;
	}
	for(int i=3;i*i<num;i+=2){
		if(num%i==0){
			return false;
		}
	}
	return true;
}

int main(){
	
	int number;
	printf("Enter the number to be cheeked as prime:  ");
	scanf("%d",&number);
	if(number>=10000){
		printf("Enter within the range of 10k");
		return 1;
	}
	
	if(cheekPrime(number)){
		printf("%d is a PRIME NUMBER",number);
	}
	else{
		printf("%d is not a PRIME NUMBER",number);
	}
		
}