/**
 * Description of a user.
 */
export interface User {
  netid: string;
  name: { given_name: string, family_name: string };
  displayName: string;
  email: string;
};

/**
 * Defines the schema for the users document in Couchbase.
 */
export interface UserSchema extends User {
  studentClasses: Class[];
  professorClasses: Class[];
};

/**
 * Description of a class.
 */
export interface Class {
  courseId: number;
  courseNumber: number;
  courseName: string;
  course: string;
  semester: string;
  professors: User[];
  time?: Date;
  place?: string;
};

/**
 * Type of class returned when user requests his own classes.
 */
export interface UserClass extends Class {
  isProf: boolean;
  students?: User[];
}

/**
 * Defines the schema for the documents in the classes bucket in Couchbase.
 */
export interface ClassSchema extends Class {
  lectures: Lecture[];
  students: User[];
};

/**
 * Schema for lecture, which is nested in ClassSchema.
 */
export interface Lecture {
  lectureId: number;
  date: Date;
  name: string;
  class: Class;
  questionIds: number[];
};

type Question = MultipleChoiceQuestion | ShortAnswerQuestion;

export interface GenericQuestion {
  // A unique identifier for any question.
  questionId: number;
  // What the question is asking
  questionPrompt: string;
};

/**
 * Schema for a question's elements in a Lecture object.
 */
export interface MultipleChoiceQuestion extends GenericQuestion {
  // Option w/ option description ('a', 'option 1')
  options: { option: string, optionDescription: string };
  type: "MultipleChoiceQuestion";
};

export interface ShortAnswerQuestion extends GenericQuestion {
  type: "ShortAnswerQuestion";
};

export interface Response {
  response: any;
  responder: User;
};

/**
 * Schema for a document in the question bucket in Couchbase.
 */
export interface QuestionSchema {
  question: Question;
  responses: Response[];
};
