namespace backend.Dtos;

// Records used for incoming requests only — kept separate from the Student
// entity so the API's public "shape" can evolve independently of the DB table.
public record CreateStudentRequest(
    string Name,
    string RollNumber,
    string ClassName,
    string Email,
    decimal FeeDue,
    bool FeesPaid
);

public record UpdateStudentRequest(
    string Name,
    string RollNumber,
    string ClassName,
    string Email,
    decimal FeeDue,
    bool FeesPaid
);
