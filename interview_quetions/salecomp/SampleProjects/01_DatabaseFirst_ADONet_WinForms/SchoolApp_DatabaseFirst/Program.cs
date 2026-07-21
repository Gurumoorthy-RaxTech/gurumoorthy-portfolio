using System;
using System.Windows.Forms;

namespace SchoolApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // DATABASE-FIRST: no schema-creation step here - the Students table
            // is assumed to already exist (run Run_This_First.sql beforehand).
            Application.Run(new Form1());
        }
    }
}
