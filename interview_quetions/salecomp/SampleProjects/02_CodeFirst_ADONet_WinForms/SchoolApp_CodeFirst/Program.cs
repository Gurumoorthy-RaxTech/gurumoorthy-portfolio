using System;
using System.Windows.Forms;
using SchoolApp.DataAccess;

namespace SchoolApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // CODE-FIRST: create the Students table from code if it doesn't exist yet,
            // BEFORE the form (and therefore any SELECT against it) ever runs.
            DatabaseInitializer.EnsureCreated();

            Application.Run(new Form1());
        }
    }
}
