public class For_each {
    public	static	void	main(String[]	args)	{
        int[]	numbers	=	{	1,	2,	3,	4,	5,	6,	7,	8,	9,	10};
        int	sum	=	0;
        for(int	n	:	numbers)
            sum	+=	n; //for collection..array
        System.out.println("Sum	is	:	"	+	sum);
    }

}
