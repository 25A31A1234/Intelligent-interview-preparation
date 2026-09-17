from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import re

# ============================================================
# CREATE FLASK APPLICATION
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "keerthi@2007",
    "database": "interview_system"
}


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print("MySQL Error:", e)
        return None


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return "AI Interview Coach Backend is Working!"


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health", methods=["GET"])
def health_check():

    return jsonify({
        "status": "success",
        "message": "Backend is running"
    })


# ============================================================
# DATABASE TEST
# ============================================================

@app.route("/api/db-test", methods=["GET"])
def db_test():

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "status": "error",
            "message": "Failed to connect to MySQL database"
        }), 500

    try:

        if connection.is_connected():

            return jsonify({
                "status": "success",
                "message": "MySQL database connected successfully"
            })

        return jsonify({
            "status": "error",
            "message": "MySQL connection is not active"
        }), 500

    except Error as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        connection.close()


# ============================================================
# SAVE STUDENT PROFILE
# ============================================================

@app.route("/api/students", methods=["POST"])
def save_student_profile():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        full_name = str(
            data.get("full_name", "")
        ).strip()

        email = str(
            data.get("email", "")
        ).strip()

        if not full_name:

            return jsonify({
                "status": "error",
                "message": "Full name is required"
            }), 400

        if not email:

            return jsonify({
                "status": "error",
                "message": "Email is required"
            }), 400

        phone = str(
            data.get("phone", "")
        ).strip()

        college_name = str(
            data.get("college_name", "")
        ).strip()

        branch = str(
            data.get("branch", "")
        ).strip()

        year_of_study = data.get(
            "year_of_study"
        )

        technical_skills = str(
            data.get("technical_skills", "")
        ).strip()

        preferred_job_role = str(
            data.get("preferred_job_role", "")
        ).strip()

        experience_level = str(
            data.get("experience_level", "")
        ).strip()

        if year_of_study is not None:

            try:
                year_of_study = int(year_of_study)

            except (ValueError, TypeError):

                return jsonify({
                    "status": "error",
                    "message": "Year of study must be a number"
                }), 400

        connection = get_db_connection()

        if connection is None:

            return jsonify({
                "status": "error",
                "message": "Database connection failed"
            }), 500

        cursor = connection.cursor()

        query = """
        INSERT INTO students
        (
            full_name,
            email,
            phone,
            college_name,
            branch,
            year_of_study,
            technical_skills,
            preferred_job_role,
            experience_level
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            full_name,
            email,
            phone,
            college_name,
            branch,
            year_of_study,
            technical_skills,
            preferred_job_role,
            experience_level
        )

        cursor.execute(query, values)

        connection.commit()

        student_id = cursor.lastrowid

        return jsonify({
            "status": "success",
            "message": "Student profile saved successfully",
            "student_id": student_id
        }), 201

    except Error as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# CREATE INTERVIEW
# ============================================================

@app.route("/api/interviews", methods=["POST"])
def create_interview():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message": "No data received"
            }), 400

        student_id = data.get("student_id")
        job_role = data.get("job_role")
        interview_type = data.get("interview_type")
        difficulty = data.get("difficulty")
        number_of_questions = data.get(
            "number_of_questions"
        )
        duration_minutes = data.get(
            "duration_minutes"
        )
        interview_mode = data.get(
            "interview_mode"
        )

        if not student_id:

            return jsonify({
                "status": "error",
                "message": "Student ID is required"
            }), 400

        connection = get_db_connection()

        if connection is None:

            return jsonify({
                "status": "error",
                "message": "Database connection failed"
            }), 500

        cursor = connection.cursor()

        # Check student
        cursor.execute(
            "SELECT id FROM students WHERE id = %s",
            (student_id,)
        )

        if cursor.fetchone() is None:

            return jsonify({
                "status": "error",
                "message": "Student not found"
            }), 404

        query = """
        INSERT INTO interviews
        (
            student_id,
            job_role,
            interview_type,
            difficulty,
            number_of_questions,
            duration_minutes,
            interview_mode
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            student_id,
            job_role,
            interview_type,
            difficulty,
            number_of_questions,
            duration_minutes,
            interview_mode
        )

        cursor.execute(query, values)

        connection.commit()

        interview_id = cursor.lastrowid

        return jsonify({
            "status": "success",
            "message": "Interview created successfully",
            "interview_id": interview_id
        }), 201

    except Error as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Database error",
            "error": str(e)
        }), 500

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text):

    text = str(text).lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# GET IMPORTANT WORDS FROM QUESTION
# ============================================================

STOP_WORDS = {
    "what",
    "what is",
    "what are",
    "explain",
    "define",
    "describe",
    "tell",
    "about",
    "how",
    "why",
    "when",
    "where",
    "which",
    "the",
    "is",
    "are",
    "was",
    "were",
    "and",
    "or",
    "for",
    "with",
    "from",
    "this",
    "that",
    "your",
    "you",
    "can",
    "could",
    "would",
    "should",
    "does",
    "do",
    "used",
    "use"
}


def get_question_keywords(question):

    words = normalize_text(question).split()

    keywords = []

    for word in words:

        if len(word) >= 4 and word not in STOP_WORDS:

            if word not in keywords:
                keywords.append(word)

    return keywords


# ============================================================
# EXTRA CONCEPT KEYWORDS
# ============================================================

CONCEPT_KEYWORDS = {

    "python": [
        "python",
        "list",
        "tuple",
        "dictionary",
        "set",
        "function",
        "class",
        "object",
        "exception",
        "module",
        "package",
        "loop",
        "variable"
    ],

    "java": [
        "java",
        "class",
        "object",
        "constructor",
        "method",
        "inheritance",
        "polymorphism",
        "interface",
        "exception",
        "thread",
        "jvm"
    ],

    "html": [
        "html",
        "tag",
        "element",
        "attribute",
        "form",
        "table",
        "heading",
        "paragraph"
    ],

    "css": [
        "css",
        "style",
        "selector",
        "property",
        "margin",
        "padding",
        "display",
        "flex",
        "grid"
    ],

    "javascript": [
        "javascript",
        "function",
        "variable",
        "array",
        "object",
        "dom",
        "event",
        "promise",
        "async"
    ],

    "database": [
        "database",
        "sql",
        "table",
        "query",
        "primary",
        "foreign",
        "key",
        "join",
        "normalization"
    ],

    "ai": [
        "artificial",
        "intelligence",
        "agent",
        "search",
        "algorithm",
        "knowledge",
        "reasoning",
        "learning"
    ],

    "machine": [
        "machine",
        "learning",
        "model",
        "training",
        "testing",
        "dataset",
        "feature",
        "classification",
        "regression"
    ]
}


# ============================================================
# FIND CONCEPT KEYWORDS
# ============================================================

def get_concept_keywords(question):

    q = normalize_text(question)

    concepts = []

    for words in CONCEPT_KEYWORDS.values():

        matched = False

        for word in words:

            if word in q:

                matched = True
                break

        if matched:

            for word in words:

                if word not in concepts:
                    concepts.append(word)

    return concepts


# ============================================================
# ANSWER ANALYSIS
# ============================================================

def analyze_answer(question, answer):

    answer = str(answer or "").strip()

    if not answer:

        return {
            "technical": 0,
            "relevance": 0,
            "communication": 0,
            "clarity": 0,
            "completeness": 0,
            "overall": 0,
            "feedback": "No answer was provided."
        }

    normalized_answer = normalize_text(answer)

    answer_words = normalized_answer.split()

    word_count = len(answer_words)

    question_keywords = get_question_keywords(
        question
    )

    concept_keywords = get_concept_keywords(
        question
    )

    # ========================================================
    # RELEVANCE
    # ========================================================

    question_matches = 0

    for keyword in question_keywords:

        if keyword in normalized_answer:

            question_matches += 1

    if question_keywords:

        relevance = round(
            (question_matches /
             len(question_keywords)) * 100
        )

    else:

        relevance = 50

    relevance = max(
        0,
        min(100, relevance)
    )


    # ========================================================
    # TECHNICAL
    # ========================================================

    concept_matches = 0

    for keyword in concept_keywords:

        if keyword in normalized_answer:

            concept_matches += 1

    if concept_keywords:

        technical = round(
            (concept_matches /
             len(concept_keywords)) * 100
        )

    else:

        technical = relevance

    technical = max(
        0,
        min(100, technical)
    )


    # ========================================================
    # COMPLETENESS
    # ========================================================

    if word_count < 5:

        completeness = 15

    elif word_count < 10:

        completeness = 35

    elif word_count < 20:

        completeness = 60

    elif word_count < 40:

        completeness = 80

    else:

        completeness = 90


    # ========================================================
    # COMMUNICATION
    # ========================================================

    communication = 40

    if word_count >= 10:
        communication += 15

    if word_count >= 20:
        communication += 15

    if word_count >= 35:
        communication += 10

    communication = min(
        communication,
        100
    )


    # ========================================================
    # CLARITY
    # ========================================================

    sentences = re.split(
        r"[.!?]+",
        answer
    )

    valid_sentences = [
        s.strip()
        for s in sentences
        if s.strip()
    ]

    clarity = 50

    if len(valid_sentences) >= 2:
        clarity += 15

    if word_count >= 15:
        clarity += 15

    if "," in answer or "." in answer:
        clarity += 10

    clarity = min(
        clarity,
        100
    )


    # ========================================================
    # IMPORTANT LOW-RELEVANCE PROTECTION
    # ========================================================

    if relevance < 20:

        technical = min(
            technical,
            20
        )

        overall = min(
            20,
            round(
                technical * 0.45 +
                relevance * 0.20 +
                completeness * 0.15 +
                communication * 0.10 +
                clarity * 0.10
            )
        )

    else:

        overall = round(
            technical * 0.45 +
            relevance * 0.20 +
            completeness * 0.15 +
            communication * 0.10 +
            clarity * 0.10
        )


    # ========================================================
    # FEEDBACK
    # ========================================================

    if relevance < 20:

        feedback = (
            "The answer does not sufficiently address "
            "the interview question."
        )

    elif technical < 30:

        feedback = (
            "The answer is related to the question, "
            "but important technical concepts are missing."
        )

    elif overall >= 80:

        feedback = (
            "Strong answer with good relevance, "
            "technical coverage and explanation."
        )

    elif overall >= 60:

        feedback = (
            "Good attempt. Add more relevant technical "
            "details or an example."
        )

    elif overall >= 40:

        feedback = (
            "Partially relevant answer. Explain the "
            "main concept more clearly."
        )

    else:

        feedback = (
            "The answer needs more explanation and "
            "should focus directly on the question."
        )


    return {
        "technical": technical,
        "relevance": relevance,
        "communication": communication,
        "clarity": clarity,
        "completeness": completeness,
        "overall": overall,
        "feedback": feedback
    }


# ============================================================
# EVALUATE ONE ANSWER
# ============================================================

@app.route("/api/evaluate-answer", methods=["POST"])
def evaluate_answer():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message": "No data received"
            }), 400

        question = str(
            data.get("question", "")
        ).strip()

        answer = str(
            data.get("answer", "")
        ).strip()

        if not question:

            return jsonify({
                "status": "error",
                "message": "Question is required"
            }), 400

        result = analyze_answer(
            question,
            answer
        )

        return jsonify({
            "status": "success",
            **result
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ============================================================
# SAVE ANSWER + SCORE TO DATABASE
# ============================================================

@app.route("/api/save-answer", methods=["POST"])
def save_answer():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message": "No data received"
            }), 400

        interview_id = data.get(
            "interview_id"
        )

        question = str(
            data.get("question", "")
        ).strip()

        answer = str(
            data.get("answer", "")
        ).strip()

        if not interview_id:

            return jsonify({
                "status": "error",
                "message": "Interview ID is required"
            }), 400

        if not question:

            return jsonify({
                "status": "error",
                "message": "Question is required"
            }), 400

        # Evaluate answer
        result = analyze_answer(
            question,
            answer
        )

        connection = get_db_connection()

        if connection is None:

            return jsonify({
                "status": "error",
                "message": "Database connection failed"
            }), 500

        cursor = connection.cursor()

        query = """
        INSERT INTO answers
        (
            interview_id,
            question_text,
            answer_text,
            technical_score,
            relevance_score,
            communication_score,
            clarity_score,
            completeness_score,
            feedback
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        values = (
            interview_id,
            question,
            answer,
            result["technical"],
            result["relevance"],
            result["communication"],
            result["clarity"],
            result["completeness"],
            result["feedback"]
        )

        cursor.execute(
            query,
            values
        )

        connection.commit()

        answer_id = cursor.lastrowid

        return jsonify({
            "status": "success",
            "answer_id": answer_id,
            "evaluation": result
        }), 201

    except Error as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# COMPLETE INTERVIEW
# ============================================================

@app.route("/api/complete-interview", methods=["POST"])
def complete_interview():

    connection = None
    cursor = None

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "status": "error",
                "message": "No data received"
            }), 400

        interview_id = data.get(
            "interview_id"
        )

        if not interview_id:

            return jsonify({
                "status": "error",
                "message": "Interview ID is required"
            }), 400

        connection = get_db_connection()

        if connection is None:

            return jsonify({
                "status": "error",
                "message": "Database connection failed"
            }), 500

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT
                technical_score,
                relevance_score,
                communication_score,
                clarity_score,
                completeness_score
            FROM answers
            WHERE interview_id = %s
            """,
            (interview_id,)
        )

        answers = cursor.fetchall()

        if not answers:

            return jsonify({
                "status": "error",
                "message": "No answers found"
            }), 404

        count = len(answers)

        technical = round(
            sum(
                float(a["technical_score"] or 0)
                for a in answers
            ) / count
        )

        relevance = round(
            sum(
                float(a["relevance_score"] or 0)
                for a in answers
            ) / count
        )

        communication = round(
            sum(
                float(a["communication_score"] or 0)
                for a in answers
            ) / count
        )

        clarity = round(
            sum(
                float(a["clarity_score"] or 0)
                for a in answers
            ) / count
        )

        completeness = round(
            sum(
                float(a["completeness_score"] or 0)
                for a in answers
            ) / count
        )

        overall = round(
            technical * 0.45 +
            relevance * 0.20 +
            completeness * 0.15 +
            communication * 0.10 +
            clarity * 0.10
        )

        # Update interview
        cursor.execute(
            """
            UPDATE interviews
            SET overall_score = %s
            WHERE id = %s
            """,
            (
                overall,
                interview_id
            )
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "interview_id": interview_id,
            "technical": technical,
            "relevance": relevance,
            "communication": communication,
            "clarity": clarity,
            "completeness": completeness,
            "overall": overall,
            "number_of_answers": count
        }), 200

    except Error as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )