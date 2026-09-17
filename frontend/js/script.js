/**
 * ============================================================
 * AI INTERVIEW COACH - script.js
 * ============================================================
 * ONE FILE / THREE PARTS
 * PART 1 : Profile + Resume + Setup
 * PART 2 : 30 questions per role/type + Random + Exact Timer + Voice
 * PART 3 : Result + Dashboard + Preparation
 * ============================================================
 */

'use strict';

var API_BASE_URL = 'http://127.0.0.1:5000';

var STORAGE_KEYS = {
    PROFILE: 'aiInterviewProfile',
    RESUME: 'aiInterviewResume',
    SETTINGS: 'aiInterviewSettings',
    ANSWERS: 'aiInterviewAnswers',
    TASKS: 'aiInterviewTaskProgress',
    STUDENT_ID: 'aiInterviewStudentId',
    INTERVIEW_ID: 'aiInterviewId',
    RESULTS: 'aiInterviewResults',
    HISTORY: 'aiInterviewHistory',
    SELECTED: 'aiInterviewSelectedQuestions'
};

var ROLES = [
    'Python Developer',
    'Java Developer',
    'Web Developer',
    'Data Analyst',
    'AI/ML Engineer',
    'Software Developer'
];

var TYPES = [
    'Technical Interview',
    'HR Interview',
    'Behavioral Interview',
    'Mixed Interview'
];

var DIFFICULTIES = [
    'Beginner',
    'Intermediate',
    'Advanced'
];


// ============================================================
// COMMON UTILITIES
// ============================================================

function getEl(id) {
    return document.getElementById(id);
}

function getStorage(key) {
    try {
        var value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (e) {
        return null;
    }
}

function setStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        return false;
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {}
}

function escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';

    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k, 2));

    return parseFloat(
        (bytes / Math.pow(k, i)).toFixed(1)
    ) + ' ' + sizes[i];
}

function showMessage(message, type) {
    var element = getEl('messageArea');

    if (!element) return;

    element.textContent = message;
    element.className = 'message-area show ' + (type || 'info');
}

function hideMessage() {
    var element = getEl('messageArea');

    if (element) {
        element.className = 'message-area';
    }
}

function shuffle(array) {
    var copy = array.slice();

    for (var i = copy.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));

        var temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }

    return copy;
}


// ============================================================
// PART 1 - PROFILE
// ============================================================

function initProfilePage() {

    var form = getEl('profileForm');

    if (!form) return;

    var button = getEl('saveProfileBtn');

    if (!button) return;

    var savedProfile = getStorage(STORAGE_KEYS.PROFILE);

    if (savedProfile) {

        if (getEl('fullName'))
            getEl('fullName').value = savedProfile.fullName || '';

        if (getEl('email'))
            getEl('email').value = savedProfile.email || '';

        if (getEl('phone'))
            getEl('phone').value = savedProfile.phone || '';

        if (getEl('college'))
            getEl('college').value = savedProfile.college || '';

        if (getEl('branch'))
            getEl('branch').value = savedProfile.branch || '';

        if (getEl('year'))
            getEl('year').value = savedProfile.year || '';

        if (getEl('skills'))
            getEl('skills').value = savedProfile.skills || '';

        if (getEl('jobRole'))
            getEl('jobRole').value = savedProfile.jobRole || '';

        if (getEl('expLevel'))
            getEl('expLevel').value = savedProfile.expLevel || '';
    }

    var busy = false;

    form.addEventListener('submit', function (event) {

        event.preventDefault();
        event.stopPropagation();

        if (busy) return;

        busy = true;

        hideMessage();

        var fullName = getEl('fullName');
        var email = getEl('email');
        var phone = getEl('phone');
        var college = getEl('college');
        var branch = getEl('branch');
        var year = getEl('year');
        var skills = getEl('skills');
        var jobRole = getEl('jobRole');
        var expLevel = getEl('expLevel');

        var fields = [
            fullName,
            email,
            college,
            branch,
            year,
            skills,
            jobRole,
            expLevel
        ];

        var valid = true;

        fields.forEach(function (field) {

            if (
                field &&
                !String(field.value || '').trim()
            ) {

                field.classList.add('is-invalid');
                valid = false;

            } else if (field) {

                field.classList.remove('is-invalid');
            }
        });

        if (
            email &&
            email.value.trim() &&
            email.value.indexOf('@') === -1
        ) {

            email.classList.add('is-invalid');
            valid = false;
        }

        if (!valid) {

            showMessage(
                'Please fill in all required fields correctly.',
                'error'
            );

            busy = false;

            return;
        }

        var data = {

            full_name: fullName.value.trim(),

            email: email.value.trim(),

            phone: phone
                ? phone.value.trim()
                : '',

            college_name: college.value.trim(),

            branch: branch.value,

            year_of_study:
                parseInt(year.value, 10) || 0,

            technical_skills:
                skills.value.trim(),

            preferred_job_role:
                jobRole.value,

            experience_level:
                expLevel.value
        };

        setStorage(
            STORAGE_KEYS.PROFILE,
            {
                fullName: data.full_name,
                email: data.email,
                phone: data.phone,
                college: data.college_name,
                branch: data.branch,
                year: data.year_of_study,
                skills: data.technical_skills,
                jobRole: data.preferred_job_role,
                expLevel: data.experience_level
            }
        );

        var oldButtonHTML = button.innerHTML;

        button.disabled = true;

        button.innerHTML =
            '<i class="fas fa-spinner fa-spin me-2"></i> Saving...';

        fetch(
            API_BASE_URL + '/api/students',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(data)
            }
        )

        .then(function (response) {

            return response.json().then(function (data) {

                return {
                    ok: response.ok,
                    data: data
                };
            });
        })

        .then(function (result) {

            if (
                result.ok &&
                result.data &&
                result.data.status === 'success'
            ) {

                if (result.data.student_id) {

                    setStorage(
                        STORAGE_KEYS.STUDENT_ID,
                        result.data.student_id
                    );
                }

                showMessage(
                    'Profile saved successfully!',
                    'success'
                );

                setTimeout(function () {

                    location.href = 'resume.html';

                }, 500);

            } else {

                showMessage(
                    (result.data && result.data.message) ||
                    'Unable to save profile.',
                    'error'
                );

                button.disabled = false;
                button.innerHTML = oldButtonHTML;

                busy = false;
            }
        })

        .catch(function (error) {

            console.error(error);

            showMessage(
                'Backend connection failed. Make sure Flask is running.',
                'error'
            );

            button.disabled = false;
            button.innerHTML = oldButtonHTML;

            busy = false;
        });
    });
}


// ============================================================
// PART 1 - RESUME
// ============================================================

function initResumePage() {

    var input = getEl('resumeInput');

    if (!input) return;

    var zone = getEl('uploadZone');
    var choose = getEl('chooseBtn');
    var info = getEl('fileInfoContainer');
    var name = getEl('fileName');
    var size = getEl('fileSize');
    var remove = getEl('removeFileBtn');
    var error = getEl('fileError');


    function showFile(nameValue, sizeValue) {

        if (name)
            name.textContent = nameValue;

        if (size)
            size.textContent =
                '(' + formatFileSize(sizeValue) + ')';

        if (info)
            info.style.display = 'flex';

        if (error)
            error.classList.remove('show');
    }


    function hideFile() {

        if (info)
            info.style.display = 'none';

        if (input)
            input.value = '';

        if (error)
            error.classList.remove('show');
    }


    function handleFile(file) {

        if (!file) {

            hideFile();

            return;
        }

        var isPDF =
            file.type === 'application/pdf' ||
            file.name.toLowerCase().endsWith('.pdf');

        if (!isPDF) {

            if (error)
                error.classList.add('show');

            hideFile();

            return;
        }

        showFile(
            file.name,
            file.size
        );

        setStorage(
            STORAGE_KEYS.RESUME,
            {
                filename: file.name,
                size: file.size
            }
        );
    }


    var savedResume =
        getStorage(STORAGE_KEYS.RESUME);

    if (
        savedResume &&
        savedResume.filename
    ) {

        showFile(
            savedResume.filename,
            savedResume.size
        );
    }


    input.addEventListener(
        'change',
        function () {

            handleFile(
                this.files &&
                this.files[0]
            );
        }
    );


    if (zone) {

        zone.addEventListener(
            'click',
            function (event) {

                if (
                    event.target.closest('#chooseBtn')
                ) {
                    return;
                }

                input.click();
            }
        );


        zone.addEventListener(
            'dragover',
            function (event) {

                event.preventDefault();

                this.style.borderColor =
                    '#7c3aed';
            }
        );


        zone.addEventListener(
            'dragleave',
            function () {

                this.style.borderColor =
                    '#cbd5e1';
            }
        );


        zone.addEventListener(
            'drop',
            function (event) {

                event.preventDefault();

                this.style.borderColor =
                    '#cbd5e1';

                var file =
                    event.dataTransfer.files &&
                    event.dataTransfer.files[0];

                if (file) {

                    handleFile(file);

                    try {

                        var dataTransfer =
                            new DataTransfer();

                        dataTransfer.items.add(file);

                        input.files =
                            dataTransfer.files;

                    } catch (e) {}
                }
            }
        );
    }


    if (choose) {

        choose.addEventListener(
            'click',
            function (event) {

                event.stopPropagation();

                input.click();
            }
        );
    }


    if (remove) {

        remove.addEventListener(
            'click',
            function (event) {

                event.stopPropagation();

                hideFile();

                removeStorage(
                    STORAGE_KEYS.RESUME
                );
            }
        );
    }
}


// ============================================================
// PART 1 - SETUP
// ============================================================

function initSetupPage() {

    var form = getEl('setupForm');

    if (!form) return;

    var role = getEl('jobRole');
    var type = getEl('interviewType');
    var count = getEl('numQuestions');
    var duration = getEl('duration');

    var summaryRole = getEl('sumJobRole');
    var summaryType = getEl('sumInterviewType');
    var summaryDifficulty = getEl('sumDifficulty');
    var summaryCount = getEl('sumQuestions');
    var summaryDuration = getEl('sumDuration');
    var summaryMode = getEl('sumMode');


    var savedSettings =
        getStorage(STORAGE_KEYS.SETTINGS);

    var profile =
        getStorage(STORAGE_KEYS.PROFILE);


    if (savedSettings) {

        if (
            role &&
            savedSettings.jobRole
        ) {
            role.value =
                savedSettings.jobRole;
        }

        if (
            type &&
            savedSettings.interviewType
        ) {
            type.value =
                savedSettings.interviewType;
        }

        if (
            count &&
            savedSettings.numQuestions
        ) {
            count.value =
                savedSettings.numQuestions;
        }

        if (
            duration &&
            savedSettings.duration
        ) {
            duration.value =
                savedSettings.duration;
        }
    }


    if (
        profile &&
        profile.jobRole &&
        role &&
        (!savedSettings ||
            !savedSettings.jobRole)
    ) {

        Array.prototype.some.call(
            role.options,
            function (option) {

                if (
                    option.value ===
                    profile.jobRole
                ) {

                    role.value =
                        option.value;

                    return true;
                }

                return false;
            }
        );
    }


    var difficultyRadios =
        document.querySelectorAll(
            'input[name="difficulty"]'
        );

    var difficultyOptions =
        document.querySelectorAll(
            '.difficulty-option'
        );

    var modeRadios =
        document.querySelectorAll(
            'input[name="mode"]'
        );

    var modeOptions =
        document.querySelectorAll(
            '.mode-option'
        );


    function selected(radios, defaultValue) {

        var value = defaultValue;

        radios.forEach(function (radio) {

            if (radio.checked) {

                value = radio.value;
            }
        });

        return value;
    }


    function activate(
        radios,
        options,
        value,
        className
    ) {

        radios.forEach(function (radio) {

            if (radio.value === value) {

                radio.checked = true;

                options.forEach(function (option) {

                    option.classList.remove(
                        'active'
                    );
                });

                var parent =
                    radio.closest(className);

                if (parent) {

                    parent.classList.add(
                        'active'
                    );
                }
            }
        });
    }


    if (
        savedSettings &&
        savedSettings.difficulty
    ) {

        activate(
            difficultyRadios,
            difficultyOptions,
            savedSettings.difficulty,
            '.difficulty-option'
        );
    }


    if (
        savedSettings &&
        savedSettings.mode
    ) {

        activate(
            modeRadios,
            modeOptions,
            savedSettings.mode,
            '.mode-option'
        );
    }


    function updateSummary() {

        if (summaryRole) {

            summaryRole.textContent =
                role && role.value
                    ? role.value
                    : '—';
        }


        if (summaryType) {

            summaryType.textContent =
                type && type.value
                    ? type.value
                    : '—';
        }


        if (summaryDifficulty) {

            summaryDifficulty.textContent =
                selected(
                    difficultyRadios,
                    'Beginner'
                );
        }


        if (summaryCount) {

            summaryCount.textContent =
                count && count.value
                    ? count.value
                    : '—';
        }


        if (summaryDuration) {

            var durationValue =
                duration
                    ? duration.value
                    : '';

            summaryDuration.textContent =
                durationValue
                    ? durationValue + ' min'
                    : '—';
        }


        if (summaryMode) {

            summaryMode.textContent =
                selected(
                    modeRadios,
                    'Voice Answer'
                );
        }
    }


    if (role)
        role.addEventListener(
            'change',
            updateSummary
        );

    if (type)
        type.addEventListener(
            'change',
            updateSummary
        );

    if (count)
        count.addEventListener(
            'change',
            updateSummary
        );

    if (duration)
        duration.addEventListener(
            'change',
            updateSummary
        );


    difficultyRadios.forEach(
        function (radio) {

            radio.addEventListener(
                'change',
                function () {

                    difficultyOptions.forEach(
                        function (option) {

                            option.classList.remove(
                                'active'
                            );
                        }
                    );

                    var parent =
                        this.closest(
                            '.difficulty-option'
                        );

                    if (parent) {

                        parent.classList.add(
                            'active'
                        );
                    }

                    updateSummary();
                }
            );
        }
    );


    difficultyOptions.forEach(
        function (option) {

            option.addEventListener(
                'click',
                function () {

                    var radio =
                        this.querySelector(
                            'input[type="radio"]'
                        );

                    if (radio) {

                        radio.checked = true;

                        difficultyOptions.forEach(
                            function (item) {

                                item.classList.remove(
                                    'active'
                                );
                            }
                        );

                        this.classList.add(
                            'active'
                        );

                        updateSummary();
                    }
                }
            );
        }
    );


    modeRadios.forEach(
        function (radio) {

            radio.addEventListener(
                'change',
                function () {

                    modeOptions.forEach(
                        function (option) {

                            option.classList.remove(
                                'active'
                            );
                        }
                    );

                    var parent =
                        this.closest(
                            '.mode-option'
                        );

                    if (parent) {

                        parent.classList.add(
                            'active'
                        );
                    }

                    updateSummary();
                }
            );
        }
    );


    modeOptions.forEach(
        function (option) {

            option.addEventListener(
                'click',
                function () {

                    var radio =
                        this.querySelector(
                            'input[type="radio"]'
                        );

                    if (radio) {

                        radio.checked = true;

                        modeOptions.forEach(
                            function (item) {

                                item.classList.remove(
                                    'active'
                                );
                            }
                        );

                        this.classList.add(
                            'active'
                        );

                        updateSummary();
                    }
                }
            );
        }
    );


    updateSummary();


    // ========================================================
    // START INTERVIEW
    // ========================================================

    var startButton =
        getEl('startBtn');

    if (startButton) {

        startButton.addEventListener(
            'click',
            function (event) {

                event.preventDefault();


                if (
                    !role ||
                    !role.value
                ) {

                    alert(
                        'Please select a Job Role.'
                    );

                    return;
                }


                if (
                    !type ||
                    !type.value
                ) {

                    alert(
                        'Please select an Interview Type.'
                    );

                    return;
                }


                var questionCount =
                    parseInt(
                        count &&
                        count.value,
                        10
                    ) || 10;


                if (
                    [5, 10, 15, 20]
                        .indexOf(questionCount) < 0
                ) {

                    questionCount = 10;
                }


                // EXACT USER-SELECTED DURATION
                // No hidden 2/6/2 minute limit.

                var minutes =
                    parseInt(
                        duration &&
                        duration.value,
                        10
                    ) || 15;


                if (minutes < 1) {

                    minutes = 15;
                }


                var settings = {

                    jobRole:
                        role.value,

                    interviewType:
                        type.value,

                    difficulty:
                        selected(
                            difficultyRadios,
                            'Beginner'
                        ),

                    numQuestions:
                        questionCount,

                    duration:
                        minutes,

                    mode:
                        selected(
                            modeRadios,
                            'Voice Answer'
                        )
                };


                setStorage(
                    STORAGE_KEYS.SETTINGS,
                    settings
                );


                // Start a completely new interview.

                setStorage(
                    STORAGE_KEYS.ANSWERS,
                    {}
                );


                removeStorage(
                    STORAGE_KEYS.SELECTED
                );


                location.href =
                    'interview.html';
            }
        );
    }
}


// ============================================================
// END OF PART 1
// ============================================================


// PART 2 will be pasted directly BELOW this line.
// Do not create another script.js file.
// ============================================================
// PART 2 - QUESTION DATA
// 30 questions x 6 roles x 4 types = 720 questions at runtime.
// ============================================================

var TECH = {

    'Python Developer': [
        'Explain the difference between a list and a tuple in Python.',
        'What are functions in Python and why are they useful?',
        'What is exception handling in Python?',
        'Explain classes and objects in Python.',
        'What is a dictionary and how is it used?',
        'What is the difference between == and is in Python?',
        'Explain mutable and immutable objects.',
        'What is a list comprehension?',
        'What are *args and **kwargs?',
        'What is the purpose of pass?',
        'Explain inheritance in Python.',
        'What is method overriding?',
        'Explain decorators.',
        'What is a lambda function?',
        'How does Python manage memory?',
        'Explain generators and yield.',
        'What are iterators?',
        'Explain shallow copy and deep copy.',
        'What is a virtual environment?',
        'Explain Python exception hierarchy.',
        'Explain modules and packages.',
        'Difference between append and extend?',
        'Explain map, filter and reduce.',
        'What is the Global Interpreter Lock?',
        'How would you optimize slow Python code?',
        'Explain file handling.',
        'How do you connect Python to a database?',
        'What are unit tests in Python?',
        'Explain context managers and with.',
        'How would you structure a production Python project?'
    ],

    'Java Developer': [
        'Explain the main features of Java.',
        'Difference between JDK, JRE and JVM?',
        'Explain primitive and reference data types.',
        'What is a class and object?',
        'Explain method overloading.',
        'Explain method overriding.',
        'What is inheritance?',
        'Explain encapsulation.',
        'What is abstraction?',
        'Explain interfaces.',
        'Difference between == and equals()?',
        'Explain constructors.',
        'What is the this keyword?',
        'What is the super keyword?',
        'Explain static members.',
        'Explain final variables, methods and classes.',
        'What is exception handling?',
        'Checked versus unchecked exceptions?',
        'What is the collection framework?',
        'ArrayList versus LinkedList?',
        'What is HashMap?',
        'Explain HashSet.',
        'What are generics?',
        'What is multithreading?',
        'Explain synchronization.',
        'What is garbage collection?',
        'Explain Java streams.',
        'What is a lambda expression?',
        'How do you connect Java to a database?',
        'How would you design a maintainable Java application?'
    ],

    'Web Developer': [
        'What is HTML and why is it used?',
        'What is CSS and what problem does it solve?',
        'Explain the purpose of JavaScript.',
        'What is the DOM?',
        'Explain semantic HTML.',
        'What is responsive web design?',
        'Explain CSS Flexbox.',
        'Explain CSS Grid.',
        'What is an event in JavaScript?',
        'Explain event bubbling.',
        'What is a JavaScript function?',
        'What are promises?',
        'Explain async and await.',
        'What is JSON?',
        'What is an API?',
        'Explain REST API principles.',
        'What is HTTP and HTTPS?',
        'Explain GET and POST.',
        'What is CORS?',
        'What is localStorage?',
        'Session storage versus cookies?',
        'What is frontend validation?',
        'How can a web page be optimized?',
        'What is web accessibility?',
        'Explain CSS positioning.',
        'Explain JavaScript array methods.',
        'How does fetch() work?',
        'What is authentication?',
        'What is authorization?',
        'How would you secure a web application?'
    ],

    'Data Analyst': [
        'What is data analysis?',
        'Explain structured and unstructured data.',
        'Difference between data and information?',
        'What is a dataset?',
        'Explain mean, median and mode.',
        'What is standard deviation?',
        'What is correlation?',
        'Correlation versus causation?',
        'Explain data cleaning.',
        'What is a missing value?',
        'How can missing values be handled?',
        'What is an outlier?',
        'Explain normalization.',
        'What is data visualization?',
        'Why are charts useful?',
        'What is NumPy?',
        'What is Pandas?',
        'Explain a Pandas DataFrame.',
        'What is groupby in Pandas?',
        'What is a pivot table?',
        'Explain SQL SELECT.',
        'What is a SQL JOIN?',
        'Explain GROUP BY and HAVING.',
        'What is a subquery?',
        'What is a primary key?',
        'Explain data aggregation.',
        'What is exploratory data analysis?',
        'How do you validate an analysis?',
        'How do you communicate insights to nontechnical users?',
        'How would you design a complete data analysis workflow?'
    ],

    'AI/ML Engineer': [
        'What is artificial intelligence?',
        'What is machine learning?',
        'Supervised versus unsupervised learning?',
        'What is reinforcement learning?',
        'What is a feature?',
        'What is a label?',
        'Explain training and testing data.',
        'What is overfitting?',
        'What is underfitting?',
        'Explain train-test split.',
        'What is cross-validation?',
        'What is a confusion matrix?',
        'Explain accuracy, precision and recall.',
        'What is F1-score?',
        'What is linear regression?',
        'What is logistic regression?',
        'Explain decision trees.',
        'What is random forest?',
        'What is K-means clustering?',
        'What is dimensionality reduction?',
        'Explain neural networks.',
        'What is an activation function?',
        'What is gradient descent?',
        'What is a loss function?',
        'What is an epoch?',
        'What is a hyperparameter?',
        'How do you handle imbalanced data?',
        'What is feature engineering?',
        'How do you evaluate an ML model?',
        'How would you deploy an ML model?'
    ],

    'Software Developer': [
        'What is software development?',
        'Explain the software development life cycle.',
        'What is a requirement?',
        'What is a software specification?',
        'Explain object-oriented programming.',
        'What is a class?',
        'What is inheritance?',
        'What is polymorphism?',
        'What is encapsulation?',
        'What is abstraction?',
        'What is an algorithm?',
        'What is time complexity?',
        'What is space complexity?',
        'Explain arrays and linked lists.',
        'What is a stack?',
        'What is a queue?',
        'What is a hash table?',
        'What is a binary search tree?',
        'What is recursion?',
        'Explain sorting algorithms.',
        'Explain searching algorithms.',
        'What is version control?',
        'What is Git?',
        'What is a REST API?',
        'What is database normalization?',
        'Explain SQL joins.',
        'What is unit testing?',
        'What is integration testing?',
        'What is debugging?',
        'How would you design a reliable software system?'
    ]
};


// ============================================================
// HR QUESTIONS
// ============================================================

var HR = [
    'Tell me about yourself.',
    'Why did you choose this career?',
    'Why are you interested in the {role} role?',
    'Why do you want to join our organization?',
    'What are your strongest skills?',
    'What technical skill are you currently improving?',
    'What is one weakness you are working on?',
    'Describe a time you solved a difficult problem.',
    'How do you handle pressure?',
    'How do you manage deadlines?',
    'How do you prioritize tasks?',
    'How do you handle feedback?',
    'How do you handle disagreement in a team?',
    'What motivates you to learn?',
    'How do you handle failure?',
    'What are your short-term career goals?',
    'What are your long-term career goals?',
    'Where do you see yourself in five years?',
    'Why should we consider you for this role?',
    'What makes you different from other candidates?',
    'How do you keep your technical knowledge current?',
    'Describe your ideal work environment.',
    'How do you communicate with teammates?',
    'What would you do if you made a mistake at work?',
    'How would you handle an urgent task with a deadline?',
    'How do you balance quality and speed?',
    'What type of manager helps you perform well?',
    'What do you expect from your first job?',
    'What questions would you ask an interviewer?',
    'Why should we hire you as a {role}?'
];


// ============================================================
// BEHAVIORAL QUESTIONS
// ============================================================

var BEHAVIORAL = [
    'Describe a project where you had a clear responsibility.',
    'Tell me about a time you learned something quickly.',
    'Describe a time you worked with a difficult teammate.',
    'Tell me about a time you solved a problem without help.',
    'Describe a time you made a mistake and learned from it.',
    'Tell me about a time you received critical feedback.',
    'Describe a time you had multiple deadlines.',
    'Tell me about a time you showed leadership.',
    'Describe a time you disagreed with a teammate.',
    'Tell me about a time you changed your approach after feedback.',
    'Describe a time you had incomplete information.',
    'Tell me about a time you handled pressure.',
    'Describe a time you helped another student or teammate.',
    'Tell me about a time you learned a new tool.',
    'Describe a time you improved a process.',
    'Tell me about a time your first solution failed.',
    'Describe a time you explained a technical idea simply.',
    'Tell me about a time you took responsibility for an outcome.',
    'Describe a time you made a decision quickly.',
    'Tell me about a time you managed conflicting priorities.',
    'Describe a time you motivated yourself to finish a task.',
    'Tell me about a time you worked with limited resources.',
    'Describe a time you used evidence to make a decision.',
    'Tell me about a time you adapted to change.',
    'Describe a time you resolved a misunderstanding.',
    'Tell me about a time you had to ask for help.',
    'Describe a time you demonstrated attention to detail.',
    'Tell me about a time you improved your own skill.',
    'Describe a time you contributed to a successful team result.',
    'Tell me about a challenging experience that changed how you work.'
];


// ============================================================
// MIXED INTERVIEW QUESTIONS
// ============================================================

var MIXED = {

    'Python Developer': [
        'Explain a Python concept with a practical example.',
        'How would you debug a Python application that fails?',
        'Which Python structure would you choose for fast key lookup?',
        'How would you explain Python to a beginner?',
        'Describe a Python project you would build for a real user.',
        'How would you test a Python function?',
        'How would you improve slow Python code?',
        'How would you handle invalid input?',
        'What would you do if a teammate disagreed with your design?',
        'How would you organize a Python project?',
        'How would you connect Python to MySQL?',
        'How would you explain an exception to a nontechnical teammate?',
        'What would you check first when Python gives wrong output?',
        'How would you learn an unfamiliar Python library?',
        'How would you prepare for a Python interview?',
        'How would you review Python code?',
        'How would you make a Python application maintainable?',
        'How would you handle a deadline for a Python feature?',
        'Explain OOP using a Python example.',
        'How would you secure a Python web application?',
        'How would you use logging while debugging?',
        'How would you choose between list, tuple and set?',
        'How would you handle a production Python bug?',
        'How would you work with unclear teammate code?',
        'How would you design a small Python REST API?',
        'How would you improve your Python skills?',
        'Explain generators in an interview.',
        'How would you handle a failed deployment?',
        'How would you combine technical knowledge with communication?',
        'What would your first week as a Python developer look like?'
    ],

    'Java Developer': [
        'Explain a Java concept with a practical example.',
        'How would you debug a Java application that fails?',
        'Which Java collection would you choose for key lookup?',
        'How would you explain Java to a beginner?',
        'Describe a Java project for a real user.',
        'How would you test a Java method?',
        'How would you improve slow Java code?',
        'How would you handle invalid input?',
        'What would you do if a teammate disagreed with your Java design?',
        'How would you organize a Java project?',
        'How would you connect Java to MySQL?',
        'How would you explain an exception to a nontechnical teammate?',
        'What would you check first when Java gives wrong output?',
        'How would you learn an unfamiliar Java library?',
        'How would you prepare for a Java interview?',
        'How would you review Java code?',
        'How would you make a Java application maintainable?',
        'How would you handle a deadline for a Java feature?',
        'Explain OOP using a Java example.',
        'How would you secure a Java web application?',
        'How would you use logging while debugging Java?',
        'How would you choose between ArrayList and LinkedList?',
        'How would you handle a production Java bug?',
        'How would you work with unclear teammate code?',
        'How would you design a small Java REST API?',
        'How would you improve your Java skills?',
        'Explain interfaces in an interview.',
        'How would you handle a failed deployment?',
        'How would you combine technical knowledge with communication?',
        'What would your first week as a Java developer look like?'
    ],

    'Web Developer': [
        'Explain an HTML or CSS concept with an example.',
        'How would you debug a web page that fails?',
        'How would you choose between Flexbox and Grid?',
        'How would you explain JavaScript to a beginner?',
        'Describe a web project for a real user.',
        'How would you test a web form?',
        'How would you improve a slow web page?',
        'How would you handle invalid form input?',
        'What would you do if a teammate disagreed with your UI design?',
        'How would you organize a frontend project?',
        'How would you connect a frontend to a REST API?',
        'How would you explain CORS to a teammate?',
        'What would you check when a page shows wrong data?',
        'How would you learn an unfamiliar JavaScript library?',
        'How would you prepare for a web interview?',
        'How would you review frontend code?',
        'How would you make a web application maintainable?',
        'How would you handle a deadline for a web feature?',
        'Explain the DOM with a simple example.',
        'How would you secure a web application?',
        'How would you use developer tools for debugging?',
        'How would you choose localStorage, cookies or a database?',
        'How would you handle a production web bug?',
        'How would you work with unclear teammate code?',
        'How would you design a small frontend application?',
        'How would you improve your web skills?',
        'Explain asynchronous JavaScript in an interview.',
        'How would you handle a failed deployment?',
        'How would you combine technical knowledge with communication?',
        'What would your first week as a web developer look like?'
    ],

    'Data Analyst': [
        'Explain a data analysis concept with an example.',
        'How would you investigate incorrect dataset values?',
        'Which chart would you choose to compare categories?',
        'How would you explain data analysis to a beginner?',
        'Describe a data project for a real user.',
        'How would you validate an analysis?',
        'How would you improve a slow data workflow?',
        'How would you handle missing values?',
        'What would you do if a teammate disagreed with your analysis?',
        'How would you organize a data analysis project?',
        'How would you connect analysis to MySQL?',
        'How would you explain a statistical result simply?',
        'What would you check when a chart looks misleading?',
        'How would you learn an unfamiliar analytics library?',
        'How would you prepare for a data analyst interview?',
        'How would you review another analyst’s work?',
        'How would you make analysis reproducible?',
        'How would you handle a report deadline?',
        'Explain correlation with a simple example.',
        'How would you protect sensitive data?',
        'How would you use SQL in analysis?',
        'How would you decide whether an outlier matters?',
        'How would you handle an analysis error after presentation?',
        'How would you work with a teammate who interprets data differently?',
        'How would you design a dashboard?',
        'How would you improve your data skills?',
        'How would you explain a model result?',
        'How would you handle a failed data pipeline?',
        'How would you combine technical knowledge with communication?',
        'What would your first week as a data analyst look like?'
    ],

    'AI/ML Engineer': [
        'Explain an AI/ML concept with an example.',
        'How would you debug an ML model that performs poorly?',
        'Which metric would you choose for imbalanced classification?',
        'How would you explain machine learning to a beginner?',
        'Describe an ML project for a real user.',
        'How would you evaluate an ML model?',
        'How would you improve a slow ML pipeline?',
        'How would you handle missing or noisy training data?',
        'What would you do if a teammate disagreed with your model design?',
        'How would you organize an ML project?',
        'How would you connect an ML model to an API?',
        'How would you explain overfitting simply?',
        'What would you check when model accuracy drops?',
        'How would you learn an unfamiliar ML library?',
        'How would you prepare for an AI/ML interview?',
        'How would you review another engineer’s model work?',
        'How would you make an ML experiment reproducible?',
        'How would you handle a deadline for an ML feature?',
        'Explain a neural network simply.',
        'How would you protect training data?',
        'How would you use Python in an ML project?',
        'How would you decide whether a model is ready?',
        'How would you handle a production model failure?',
        'How would you work with different model interpretations?',
        'How would you design a small ML application?',
        'How would you improve your ML skills?',
        'Explain precision and recall in an interview.',
        'How would you handle a failed model deployment?',
        'How would you combine technical knowledge with communication?',
        'What would your first week as an AI/ML engineer look like?'
    ],

    'Software Developer': [
        'Explain a software development concept with an example.',
        'How would you debug an application that fails?',
        'Which data structure would you choose for fast lookup?',
        'How would you explain software development to a beginner?',
        'Describe a software project for a real user.',
        'How would you test a feature?',
        'How would you improve slow software?',
        'How would you handle invalid input?',
        'What would you do if a teammate disagreed with your design?',
        'How would you organize a software project?',
        'How would you connect an application to MySQL?',
        'How would you explain an exception simply?',
        'What would you check when software gives wrong output?',
        'How would you learn an unfamiliar technology?',
        'How would you prepare for a software interview?',
        'How would you review code?',
        'How would you make software maintainable?',
        'How would you handle a feature deadline?',
        'Explain OOP with a simple example.',
        'How would you secure software?',
        'How would you use logging while debugging?',
        'How would you choose an appropriate data structure?',
        'How would you handle a production bug?',
        'How would you work with unclear teammate code?',
        'How would you design a small REST application?',
        'How would you improve your software skills?',
        'Explain time complexity in an interview.',
        'How would you handle a failed deployment?',
        'How would you combine technical knowledge with communication?',
        'What would your first week as a software developer look like?'
    ]
};


// ============================================================
// CREATE QUESTION BANKS
// ============================================================

function makeQ(id, text, topic, i) {

    return {
        id: id,
        text: text,
        topic: topic,
        difficulty: i < 10
            ? 'Beginner'
            : (i < 20 ? 'Intermediate' : 'Advanced')
    };
}


var BANKS = {};

ROLES.forEach(function(role) {

    BANKS[role] = {};

    BANKS[role]['Technical Interview'] =
        TECH[role].map(function(t, i) {
            return makeQ(
                role + '-T-' + (i + 1),
                t,
                'Technical',
                i
            );
        });

    BANKS[role]['HR Interview'] =
        HR.map(function(t, i) {
            return makeQ(
                role + '-H-' + (i + 1),
                t.replace(/\{role\}/g, role),
                'HR',
                i
            );
        });

    BANKS[role]['Behavioral Interview'] =
        BEHAVIORAL.map(function(t, i) {
            return makeQ(
                role + '-B-' + (i + 1),
                t,
                'Behavioral',
                i
            );
        });

    BANKS[role]['Mixed Interview'] =
        MIXED[role].map(function(t, i) {
            return makeQ(
                role + '-M-' + (i + 1),
                t,
                'Mixed',
                i
            );
        });

});


// ============================================================
// RANDOM QUESTION SELECTION
// ============================================================

function getInterviewQuestions(settings) {

    var role = settings.jobRole || 'Python Developer';

    var type = settings.interviewType ||
        'Technical Interview';

    var diff = settings.difficulty ||
        'Beginner';

    var count =
        parseInt(settings.numQuestions, 10) || 5;

    if (!BANKS[role]) {
        role = 'Python Developer';
    }

    if (!BANKS[role][type]) {
        type = 'Technical Interview';
    }

    var bank = BANKS[role][type];

    var filtered = bank.filter(function(q) {
        return q.difficulty === diff;
    });

    if (filtered.length < count) {
        filtered = bank;
    }

    return shuffle(filtered).slice(
        0,
        Math.min(count, 30)
    );
}


// ============================================================
// PART 2 - INTERVIEW + EXACT TIMER + REAL VOICE
// ============================================================

function createRecognition() {

    var SR =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SR) {
        return null;
    }

    var r = new SR();

    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.lang = 'en-IN';

    return r;
}


function initInterviewPage() {

    var questionEl = getEl('questionText');

    if (!questionEl) {
        return;
    }

    var settings =
        getStorage(STORAGE_KEYS.SETTINGS) || {

            jobRole: 'Python Developer',
            interviewType: 'Technical Interview',
            difficulty: 'Beginner',
            numQuestions: 5,
            duration: 15,
            mode: 'Voice Answer'

        };


    var questions =
        getInterviewQuestions(settings);

    var total = questions.length;
    var index = 0;

    // EXACT SELECTED DURATION
    var seconds =
        (parseInt(settings.duration, 10) || 15) * 60;


    var timer = null;
    var timerStopped = false;

    var recording = false;

    var recognition =
        createRecognition();

    var answers =
        getStorage(STORAGE_KEYS.ANSWERS) || {};

    var finalText = '';


    var topic =
        getEl('topicBadge');

    var diff =
        getEl('difficultyBadge');

    var qnum =
        getEl('qNumberDisplay');

    var counter =
        getEl('questionCounterDisplay');

    var bar =
        getEl('progressBar');

    var label =
        getEl('progressLabel');

    var area =
        getEl('answerTextarea');

    var mic =
        getEl('micButton');

    var micLabel =
        getEl('micLabel');

    var indicator =
        getEl('recordingIndicator');

    var prev =
        getEl('prevBtn');

    var next =
        getEl('nextBtn');

    var finish =
        getEl('finishBtn');

    var timerEl =
        getEl('timerDisplay');

    var up =
        getEl('timeUpMessage');


    // SAVE EXACT QUESTION IDS
    // This allows Result page to use the SAME questions.
    setStorage(
        STORAGE_KEYS.SELECTED,
        questions.map(function(q) {
            return q.id;
        })
    );


    function updateTimer() {

        if (!timerEl) {
            return;
        }

        var m =
            Math.floor(seconds / 60);

        var s =
            seconds % 60;

        timerEl.textContent =
            String(m).padStart(2, '0') +
            ':' +
            String(s).padStart(2, '0');


        timerEl.classList.toggle(
            'warning',
            seconds <= 10
        );


        if (seconds <= 0) {

            seconds = 0;

            timerEl.textContent = '00:00';

            if (up) {
                up.style.display = 'block';
            }

            timerStopped = true;

            if (timer) {
                clearInterval(timer);
                timer = null;
            }

            if (recording) {
                stopVoice();
            }

        } else {

            if (up) {
                up.style.display = 'none';
            }

        }

    }


    function startTimer() {

        if (timer) {
            return;
        }

        updateTimer();

        timer = setInterval(function() {

            if (seconds > 0) {

                seconds--;

                updateTimer();

            } else {

                clearInterval(timer);

                timer = null;

                timerStopped = true;

                updateTimer();

            }

        }, 1000);

    }


    function save() {

        if (!area) {
            return;
        }

        var q = questions[index];

        if (!q) {
            return;
        }

        var key = 'q' + q.id;

        var txt =
            area.value.trim();


        if (txt) {

            answers[key] = txt;

        } else {

            delete answers[key];

        }


        setStorage(
            STORAGE_KEYS.ANSWERS,
            answers
        );

    }


    function ui(active) {

        if (mic) {
            mic.classList.toggle(
                'recording',
                active
            );
        }

        if (micLabel) {

            micLabel.textContent =
                active
                    ? 'Stop'
                    : 'Start Answer';

        }

        if (indicator) {

            indicator.classList.toggle(
                'show',
                active
            );

        }

    }


    function render(i) {

        var q = questions[i];

        if (!q) {
            return;
        }


        questionEl.textContent =
            q.text;


        if (topic) {
            topic.textContent =
                q.topic;
        }


        if (diff) {
            diff.textContent =
                q.difficulty;
        }


        if (qnum) {

            qnum.textContent =
                'Question ' + (i + 1);

        }


        if (counter) {

            counter.textContent =
                'Q' + (i + 1) +
                ' / ' + total;

        }


        var pct =
            ((i + 1) / total) * 100;


        if (bar) {

            bar.style.width =
                pct + '%';

            bar.setAttribute(
                'aria-valuenow',
                pct
            );

        }


        if (label) {

            label.textContent =
                'Question ' +
                (i + 1) +
                ' of ' +
                total;

        }


        if (prev) {

            prev.disabled =
                i === 0;

        }


        if (next) {

            next.style.display =
                i === total - 1
                    ? 'none'
                    : '';

        }


        if (area) {

            area.value =
                answers['q' + q.id] || '';

        }


        finalText = '';


        if (recording) {
            stopVoice();
        }

    }


    function go(i) {

        save();

        if (i < 0 || i >= total) {
            return;
        }

        index = i;

        render(index);

    }


    function startVoice() {

        if (timerStopped) {

            alert(
                'Time is up! Please finish the interview.'
            );

            return;

        }


        if (!recognition) {

            alert(
                'Voice recognition is not supported in this browser. You can type the answer.'
            );

            return;

        }


        finalText =
            area
                ? area.value.trim()
                : '';


        try {

            recognition.start();

        } catch (e) {

            console.warn(e);

        }

    }


    function stopVoice() {

        if (recognition) {

            try {

                recognition.stop();

            } catch (e) {}

        }


        recording = false;

        ui(false);

        save();

    }


    function finishInterview() {

        save();


        if (!confirm(
            'Are you sure you want to finish the interview?'
        )) {

            return;

        }


        if (timer) {

            clearInterval(timer);

            timer = null;

        }


        if (recording) {
            stopVoice();
        }


        setStorage(
            STORAGE_KEYS.ANSWERS,
            answers
        );


        location.href =
            'result.html';

    }


    // ========================================================
    // REAL SPEECH RECOGNITION
    // ========================================================

    if (recognition) {

        recognition.onstart =
            function() {

                recording = true;

                ui(true);

            };


        recognition.onresult =
            function(e) {

                var interim = '';
                var final = '';


                for (
                    var i = e.resultIndex;
                    i < e.results.length;
                    i++
                ) {

                    var t =
                        e.results[i][0]
                            .transcript;


                    if (
                        e.results[i].isFinal
                    ) {

                        final += t + ' ';

                    } else {

                        interim += t;

                    }

                }


                if (final) {

                    finalText += final;

                }


                var all =
                    (
                        finalText +
                        ' ' +
                        interim
                    ).trim();


                if (area && all) {

                    area.value = all;

                    save();

                }

            };


        recognition.onerror =
            function(e) {

                console.warn(
                    'Voice error:',
                    e.error
                );


                recording = false;

                ui(false);


                if (
                    e.error === 'not-allowed'
                ) {

                    alert(
                        'Microphone permission was denied. Please allow microphone access for this site.'
                    );

                }

            };


        recognition.onend =
            function() {

                recording = false;

                ui(false);

            };

    }


    // ========================================================
    // BUTTON EVENTS
    // ========================================================

    if (next) {

        next.addEventListener(
            'click',
            function() {

                go(index + 1);

            }
        );

    }


    if (prev) {

        prev.addEventListener(
            'click',
            function() {

                go(index - 1);

            }
        );

    }


    if (mic) {

        mic.addEventListener(
            'click',
            function(e) {

                e.preventDefault();

                e.stopPropagation();


                if (recording) {

                    stopVoice();

                } else {

                    startVoice();

                }

            }
        );

    }


    if (finish) {

        finish.addEventListener(
            'click',
            finishInterview
        );

    }


    if (area) {

        area.addEventListener(
            'input',
            save
        );

    }


    // ========================================================
    // KEYBOARD NAVIGATION
    // ========================================================

    document.addEventListener(
        'keydown',
        function(e) {

            if (
                e.target &&
                (
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.tagName === 'INPUT'
                )
            ) {

                return;

            }


            if (e.key === 'ArrowRight') {

                go(index + 1);

            }


            if (e.key === 'ArrowLeft') {

                go(index - 1);

            }

        }
    );


    // ========================================================
    // START INTERVIEW
    // ========================================================

    render(0);

    startTimer();

}
// ============================================================
// PART 3 - RESULT + QUESTION-WISE SCORING
// ============================================================


// ------------------------------------------------------------
// AVERAGE
// ------------------------------------------------------------

function avg(a,k){
    if(!a.length) return 0;

    return Math.round(
        a.reduce(function(sum,item){
            return sum + (Number(item[k]) || 0);
        },0) / a.length
    );
}


/* ---------- QUESTION-AWARE SCORING ---------- */

var STOP_WORDS = [
    'what','what is','what are','why','how','when','where','which',
    'explain','define','describe','tell','about','difference','between',
    'the','a','an','and','or','of','to','in','on','for','with','from',
    'is','are','was','were','can','could','would','should','do','does',
    'your','you','give','example','examples','main','used','use'
];


function normalizeText(text){
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s]/g,' ')
        .replace(/\s+/g,' ')
        .trim();
}


function getWords(text){
    var words = normalizeText(text).split(/\s+/);

    return words.filter(function(word){
        if(word.length < 3) return false;
        if(STOP_WORDS.indexOf(word) !== -1) return false;
        return true;
    });
}


/* Common technical concepts used by the project question bank */
var CONCEPT_KEYWORDS = {

    'python': [
        'interpreted','high level','dynamically typed',
        'object oriented','indentation','readable',
        'library','libraries','module','modules'
    ],

    'java': [
        'object oriented','class','object','jvm',
        'bytecode','platform independent','garbage collection'
    ],

    'javascript': [
        'dynamic','browser','dom','event','function',
        'object','asynchronous','promise'
    ],

    'html': [
        'markup','tag','element','structure','webpage'
    ],

    'css': [
        'style','layout','selector','property','design',
        'responsive','flexbox','grid'
    ],

    'sql': [
        'database','table','query','select','insert',
        'update','delete','join'
    ],

    'database': [
        'data','table','record','query','storage',
        'database','sql'
    ],

    'machine learning': [
        'data','model','training','testing',
        'prediction','algorithm','features'
    ],

    'artificial intelligence': [
        'intelligent','agent','reasoning','learning',
        'problem','decision','knowledge'
    ],

    'ai': [
        'intelligent','agent','learning','reasoning',
        'decision','knowledge'
    ],

    'deep learning': [
        'neural','network','layers','training',
        'data','weights','backpropagation'
    ],

    'neural network': [
        'neuron','layers','weights','activation',
        'input','output','training'
    ],

    'data analyst': [
        'data','analysis','excel','sql','python',
        'visualization','insights','statistics'
    ],

    'pandas': [
        'dataframe','series','data','rows','columns',
        'analysis','python'
    ],

    'numpy': [
        'array','numerical','matrix','ndarray',
        'operations','python'
    ],

    'flask': [
        'python','web','framework','route',
        'api','server','request','response'
    ],

    'api': [
        'application','interface','request',
        'response','endpoint','server'
    ],

    'oops': [
        'class','object','inheritance',
        'encapsulation','polymorphism','abstraction'
    ],

    'oop': [
        'class','object','inheritance',
        'encapsulation','polymorphism','abstraction'
    ],

    'inheritance': [
        'class','parent','child','subclass',
        'superclass','reuse'
    ],

    'polymorphism': [
        'method','overloading','overriding',
        'object','multiple','forms'
    ],

    'exception': [
        'error','try','except','catch',
        'handling','runtime'
    ],

    'data structure': [
        'data','organization','storage',
        'operation','efficient'
    ],

    'algorithm': [
        'steps','problem','solution',
        'procedure','efficiency'
    ]
};


function getConceptKeywords(question){

    var q = normalizeText(question);
    var concepts = [];

    Object.keys(CONCEPT_KEYWORDS).forEach(function(key){

        if(q.indexOf(key) !== -1){

            CONCEPT_KEYWORDS[key].forEach(function(word){
                if(concepts.indexOf(word) === -1){
                    concepts.push(word);
                }
            });

        }

    });

    return concepts;
}


function countMatches(answer,keywords){

    if(!keywords.length) return 0;

    var lowerAnswer = normalizeText(answer);
    var matched = 0;

    keywords.forEach(function(keyword){

        var key = normalizeText(keyword);

        if(key && lowerAnswer.indexOf(key) !== -1){
            matched++;
        }

    });

    return matched;
}


function analyzeAnswer(question, text) {
    var q = String(question || '').trim().toLowerCase();
    var t = String(text || '').trim().toLowerCase();

    // No answer
    if (!t) {
        return {
            score: 0,
            technical: 0,
            relevance: 0,
            communication: 0,
            clarity: 0,
            completeness: 0,
            feedback: 'No answer was provided.'
        };
    }

    // Clean words
    var questionWords = q
        .replace(/[^a-z0-9+#.]/g, ' ')
        .split(/\s+/)
        .filter(function(w) {
            return w.length >= 3;
        });

    var answerWords = t
        .replace(/[^a-z0-9+#.]/g, ' ')
        .split(/\s+/)
        .filter(function(w) {
            return w.length >= 3;
        });

    // Common words that should not affect relevance
    var stopWords = {
        'what':1,'what is':1,'what are':1,'how':1,'why':1,
        'the':1,'and':1,'are':1,'was':1,'were':1,'for':1,
        'with':1,'this':1,'that':1,'from':1,'you':1,'your':1,
        'would':1,'could':1,'should':1,'can':1,'does':1,
        'did':1,'into':1,'about':1,'have':1,'has':1,'had':1,
        'explain':1,'describe':1,'tell':1,'give':1
    };

    // Find important words from the question
    var importantWords = questionWords.filter(function(w) {
        return !stopWords[w];
    });

    // Remove duplicates
    importantWords = importantWords.filter(function(w, i, arr) {
        return arr.indexOf(w) === i;
    });

    // Question-answer word matching
    var matched = 0;

    importantWords.forEach(function(word) {
        if (answerWords.indexOf(word) !== -1) {
            matched++;
        }
    });

    // Relevance score
    var relevance = importantWords.length > 0
        ? Math.round((matched / importantWords.length) * 100)
        : 50;

    relevance = Math.max(0, Math.min(100, relevance));

    // Technical concept matching
    var concepts = [
        'python','java','javascript','html','css','sql',
        'function','class','object','method','constructor',
        'list','tuple','set','dictionary','array',
        'exception','inheritance','polymorphism',
        'encapsulation','abstraction','database','api',
        'algorithm','data structure','stack','queue',
        'linked list','tree','graph','sorting','search',
        'machine learning','model','training','testing',
        'accuracy','overfitting','neural network',
        'debug','debugging','code','program','software',
        'project','mysql','rest','http','git'
    ];

    var conceptMatches = 0;

    concepts.forEach(function(word) {
        if (t.indexOf(word) !== -1) {
            conceptMatches++;
        }
    });

    var technical = Math.min(100, conceptMatches * 12);

    // If the answer is relevant, technical knowledge gets some credit
    if (relevance >= 60 && technical < 40) {
        technical += 15;
    }

    technical = Math.min(100, technical);

    // Completeness based on answer length
    var wordCount = answerWords.length;
    var completeness;

    if (wordCount < 5) {
        completeness = 20;
    } else if (wordCount < 10) {
        completeness = 40;
    } else if (wordCount < 20) {
        completeness = 60;
    } else if (wordCount < 35) {
        completeness = 80;
    } else {
        completeness = 95;
    }

    // Communication
    var communication;

    if (wordCount < 5) {
        communication = 25;
    } else if (wordCount < 12) {
        communication = 50;
    } else if (wordCount < 25) {
        communication = 70;
    } else {
        communication = 90;
    }

    // Clarity
    var sentences = t.split(/[.!?]+/).filter(function(s) {
        return s.trim().length > 0;
    }).length;

    var clarity = 50;

    if (sentences >= 1) clarity += 15;
    if (sentences >= 2) clarity += 10;
    if (wordCount >= 10) clarity += 10;
    if (wordCount >= 20) clarity += 10;
    if (/[.!?]/.test(text)) clarity += 5;

    clarity = Math.min(100, clarity);

    // Overall score
    var score = Math.round(
        technical * 0.30 +
        relevance * 0.30 +
        completeness * 0.15 +
        communication * 0.10 +
        clarity * 0.15
    );

    // Strong protection against completely unrelated answers
    if (relevance === 0) {
        score = Math.min(score, 20);
    } else if (relevance < 25) {
        score = Math.min(score, 30);
    } else if (relevance < 40) {
        score = Math.min(score, 45);
    }

    score = Math.max(0, Math.min(100, score));

    var feedback;

    if (score >= 80) {
        feedback = 'Strong answer. It is relevant and contains useful explanation.';
    } else if (score >= 60) {
        feedback = 'Good answer, but adding more relevant technical detail can improve it.';
    } else if (score >= 40) {
        feedback = 'Partially relevant answer. Explain the main concept more clearly.';
    } else {
        feedback = 'The answer has low relevance to the question. Focus on the asked concept.';
    }

    return {
        score: score,
        technical: Math.round(technical),
        relevance: Math.round(relevance),
        communication: Math.round(communication),
        clarity: Math.round(clarity),
        completeness: Math.round(completeness),
        feedback: feedback
    };
}/* ---------- USE THE SAME QUESTIONS FROM THE INTERVIEW ---------- */

function getSelectedInterviewQuestions(settings){

    var selectedIds =
        getStorage(STORAGE_KEYS.SELECTED) || [];

    var role =
        settings.jobRole || 'Python Developer';

    var type =
        settings.interviewType || 'Technical Interview';

    var bank =
        (BANKS[role] && BANKS[role][type]) || [];

    var questionMap = {};

    bank.forEach(function(question){
        questionMap[question.id] = question;
    });


    var selectedQuestions = selectedIds
        .map(function(id){
            return questionMap[id];
        })
        .filter(function(question){
            return question;
        });


    if(selectedQuestions.length){
        return selectedQuestions;
    }


    var questions = getInterviewQuestions(settings);

    setStorage(
        STORAGE_KEYS.SELECTED,
        questions.map(function(q){
            return q.id;
        })
    );

    return questions;
}


/* ---------- FINAL RESULT CALCULATION ---------- */

function calculateResult(){

    var settings =
        getStorage(STORAGE_KEYS.SETTINGS) || {};

    var answers =
        getStorage(STORAGE_KEYS.ANSWERS) || {};

    /* IMPORTANT:
       Use the exact questions shown during interview. */

    var questions =
        getSelectedInterviewQuestions(settings);

    var items = [];


    questions.forEach(function(q){

        var answer =
            answers['q' + q.id] || '';

        var analysis =
            analyzeAnswer(q.text,answer);


        items.push({

            questionId:q.id,

            question:q.text,

            answer:answer,

            score:analysis.score,

            technical:analysis.technical,

            relevance:analysis.relevance,

            communication:analysis.communication,

            clarity:analysis.clarity,

            completeness:analysis.completeness,

            feedback:analysis.feedback

        });

    });


    var result = {

        overall:avg(items,'score'),

        technical:avg(items,'technical'),

        relevance:avg(items,'relevance'),

        communication:avg(items,'communication'),

        clarity:avg(items,'clarity'),

        completeness:avg(items,'completeness'),

        readiness:avg(items,'score'),

        analyses:items,

        settings:settings,

        createdAt:new Date().toISOString()

    };


    return result;
}
// ============================================================
// RESULT PAGE
// ============================================================

function initResultPage() {

    var canvas =
        getEl('scoreRingCanvas');


    if (!canvas) {

        return;

    }


    var result =
        calculateResult();


    setStorage(
        STORAGE_KEYS.RESULTS,
        result
    );


    // --------------------------------------------------------
    // SAVE HISTORY
    // --------------------------------------------------------

    var history =
        getStorage(
            STORAGE_KEYS.HISTORY
        ) || [];


    history.push({

        score: result.overall,

        role:
            result.settings.jobRole,

        type:
            result.settings.interviewType,

        difficulty:
            result.settings.difficulty,

        date:
            result.createdAt

    });


    setStorage(
        STORAGE_KEYS.HISTORY,
        history.slice(-10)
    );


    // --------------------------------------------------------
    // RESULT VALUES
    // --------------------------------------------------------

    var ids = {

        resultJobRole:
            result.settings.jobRole ||
            'Python Developer',

        resultInterviewType:
            result.settings.interviewType ||
            'Technical Interview',

        resultDifficulty:
            result.settings.difficulty ||
            'Beginner',

        overallScore:
            result.overall,

        technicalScore:
            result.technical,

        relevanceScore:
            result.relevance,

        communicationScore:
            result.communication,

        clarityScore:
            result.clarity,

        completenessScore:
            result.completeness,

        readinessScore:
            result.readiness

    };


    Object.keys(ids).forEach(
        function(id) {

            var element =
                getEl(id);


            if (element) {

                element.textContent =
                    ids[id];

            }

        }
    );


    // --------------------------------------------------------
    // SCORE RING
    // --------------------------------------------------------

    var ctx =
        canvas.getContext('2d');


    var cx = 90;
    var cy = 90;
    var rad = 70;
    var lw = 12;


    ctx.clearRect(
        0,
        0,
        180,
        180
    );


    // Background circle
    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        rad,
        0,
        2 * Math.PI
    );


    ctx.strokeStyle =
        '#e2e8f0';

    ctx.lineWidth =
        lw;

    ctx.stroke();


    // Score circle
    var start =
        -Math.PI / 2;


    var end =
        start +
        2 * Math.PI *
        result.overall /
        100;


    var gradient =
        ctx.createLinearGradient(
            0,
            0,
            180,
            180
        );


    gradient.addColorStop(
        0,
        '#2563eb'
    );


    gradient.addColorStop(
        1,
        '#7c3aed'
    );


    ctx.beginPath();


    ctx.arc(
        cx,
        cy,
        rad,
        start,
        end
    );


    ctx.strokeStyle =
        gradient;

    ctx.lineWidth =
        lw;

    ctx.lineCap =
        'round';

    ctx.stroke();


    // --------------------------------------------------------
    // RADAR CHART
    // --------------------------------------------------------

    var radar =
        getEl('radarChart');


    if (
        radar &&
        typeof Chart !== 'undefined'
    ) {

        new Chart(
            radar,
            {

                type: 'radar',

                data: {

                    labels: [
                        'Technical',
                        'Relevance',
                        'Communication',
                        'Clarity',
                        'Completeness'
                    ],

                    datasets: [

                        {

                            label:
                                'Performance',

                            data: [

                                result.technical,

                                result.relevance,

                                result.communication,

                                result.clarity,

                                result.completeness

                            ],

                            backgroundColor:
                                'rgba(37,99,235,.15)',

                            borderColor:
                                '#2563eb',

                            borderWidth: 2

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        r: {

                            beginAtZero: true,

                            max: 100

                        }

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

    }


    // --------------------------------------------------------
    // READINESS BAR
    // --------------------------------------------------------

    var readinessBar =
        document.querySelector(
            '.readiness-bar .progress-bar'
        );


    if (readinessBar) {

        readinessBar.style.width =
            result.readiness + '%';

    }


    // --------------------------------------------------------
    // QUESTION-WISE ANALYSIS
    // --------------------------------------------------------

    var body =
        getEl(
            'questionAnalysisBody'
        );


    if (body) {

        body.innerHTML = '';


        result.analyses.forEach(
            function(item, index) {

                var div =
                    document.createElement(
                        'div'
                    );


                div.className =
                    'question-analysis-item';


                div.innerHTML =

                    '<strong>Q' +
                    (index + 1) +
                    ': ' +
                    escapeHTML(
                        item.question
                    ) +
                    '</strong>' +

                    '<p><b>Your Score:</b> ' +
                    item.score +
                    '/100</p>' +

                    '<p><b>Technical:</b> ' +
                    item.technical +
                    '/100</p>' +

                    '<p><b>Relevance:</b> ' +
                    item.relevance +
                    '/100</p>' +

                    '<p><b>Communication:</b> ' +
                    item.communication +
                    '/100</p>' +

                    '<p><b>Clarity:</b> ' +
                    item.clarity +
                    '/100</p>' +

                    '<p><b>Completeness:</b> ' +
                    item.completeness +
                    '/100</p>' +

                    '<p>' +
                    escapeHTML(
                        item.feedback
                    ) +
                    '</p>';


                body.appendChild(div);

            }
        );

    }

}


// ============================================================
// PART 3 - DASHBOARD
// ============================================================

function initDashboardPage() {

    var trend =
        getEl('trendChart');

    var skills =
        getEl('skillChart');


    if (!trend && !skills) {

        return;

    }


    var history =
        getStorage(
            STORAGE_KEYS.HISTORY
        ) || [];


    var scores =
        history.length
            ? history.map(function(item) {
                return item.score;
            })
            : [];


    var labels =
        scores.map(function(_, i) {

            return 'Interview ' +
                (i + 1);

        });


    var avgScore =
        scores.length
            ? Math.round(
                scores.reduce(
                    function(a, b) {
                        return a + b;
                    },
                    0
                ) / scores.length
            )
            : 0;


    var best =
        scores.length
            ? Math.max.apply(
                null,
                scores
            )
            : 0;


    if (getEl('totalInterviews')) {

        getEl(
            'totalInterviews'
        ).textContent =
            scores.length;

    }


    if (getEl('averageScore')) {

        getEl(
            'averageScore'
        ).textContent =
            avgScore;

    }


    if (getEl('bestScore')) {

        getEl(
            'bestScore'
        ).textContent =
            best;

    }


    // --------------------------------------------------------
    // SCORE TREND
    // --------------------------------------------------------

    if (
        trend &&
        typeof Chart !== 'undefined'
    ) {

        new Chart(
            trend,
            {

                type: 'line',

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                'Score',

                            data:
                                scores,

                            borderColor:
                                '#2563eb',

                            backgroundColor:
                                'rgba(37,99,235,.08)',

                            fill: true,

                            tension: .3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 100

                        }

                    }

                }

            }
        );

    }


    // --------------------------------------------------------
    // LATEST SKILLS
    // --------------------------------------------------------

    var latest =
        getStorage(
            STORAGE_KEYS.RESULTS
        );


    var values =
        latest
            ? [
                latest.technical,
                latest.relevance,
                latest.communication,
                latest.clarity,
                latest.completeness
            ]
            : [
                0,
                0,
                0,
                0,
                0
            ];


    if (
        skills &&
        typeof Chart !== 'undefined'
    ) {

        new Chart(
            skills,
            {

                type: 'bar',

                data: {

                    labels: [
                        'Technical',
                        'Relevance',
                        'Communication',
                        'Clarity',
                        'Completeness'
                    ],

                    datasets: [

                        {

                            label:
                                'Score',

                            data:
                                values,

                            backgroundColor:
                                'rgba(37,99,235,.75)',

                            borderColor:
                                '#2563eb',

                            borderWidth: 1,

                            borderRadius: 6

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    indexAxis: 'y',

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            beginAtZero: true,

                            max: 100

                        }

                    }

                }

            }
        );

    }

}


// ============================================================
// PART 3 - PREPARATION
// ============================================================

function initPreparationPage() {

    var profile = getStorage(STORAGE_KEYS.PROFILE) || {};
    var settings = getStorage(STORAGE_KEYS.SETTINGS) || {};

    var role = profile.jobRole || settings.jobRole || 'Python Developer';

    var plans = {

        'Python Developer': [
            ['Day 1', 'Python Basics', 'Variables, data types, input/output'],
            ['Day 2', 'Control Flow', 'if-else, loops, break, continue'],
            ['Day 3', 'Functions', 'Functions, arguments, return, lambda'],
            ['Day 4', 'Data Structures', 'Lists, tuples, sets, dictionaries'],
            ['Day 5', 'OOP', 'Classes, objects, inheritance, polymorphism'],
            ['Day 6', 'Exception Handling', 'try, except, finally, custom exceptions'],
            ['Day 7', 'Final Practice', 'Solve Python interview questions']
        ],

        'Java Developer': [
            ['Day 1', 'Java Basics', 'Data types, variables, operators'],
            ['Day 2', 'Control Flow', 'if-else, switch, loops'],
            ['Day 3', 'OOP Concepts', 'Classes, objects, constructors, methods'],
            ['Day 4', 'Inheritance', 'Inheritance, polymorphism, abstraction'],
            ['Day 5', 'Interfaces', 'Interfaces, abstract classes'],
            ['Day 6', 'Collections', 'ArrayList, HashSet, HashMap'],
            ['Day 7', 'Final Practice', 'Solve Java interview questions']
        ],

        'Web Developer': [
            ['Day 1', 'HTML', 'Tags, forms, tables, semantic HTML'],
            ['Day 2', 'CSS', 'Selectors, box model, layouts'],
            ['Day 3', 'JavaScript Basics', 'Variables, functions, arrays, objects'],
            ['Day 4', 'DOM', 'DOM manipulation and events'],
            ['Day 5', 'Web APIs', 'Fetch API, JSON, REST basics'],
            ['Day 6', 'Responsive Design', 'Flexbox, Grid, media queries'],
            ['Day 7', 'Final Practice', 'Solve web development questions']
        ],

        'Data Analyst': [
            ['Day 1', 'Data Analysis Basics', 'Data types and data cleaning'],
            ['Day 2', 'Excel', 'Formulas, functions, charts'],
            ['Day 3', 'SQL', 'SELECT, WHERE, GROUP BY, JOIN'],
            ['Day 4', 'Python', 'Pandas, NumPy basics'],
            ['Day 5', 'Visualization', 'Matplotlib and charts'],
            ['Day 6', 'Statistics', 'Mean, median, probability'],
            ['Day 7', 'Final Practice', 'Solve data analyst questions']
        ],

        'AI/ML Engineer': [
            ['Day 1', 'Python for AI', 'NumPy, Pandas and Python basics'],
            ['Day 2', 'ML Basics', 'Supervised and unsupervised learning'],
            ['Day 3', 'Data Preprocessing', 'Cleaning, scaling and encoding'],
            ['Day 4', 'ML Algorithms', 'Regression, classification, clustering'],
            ['Day 5', 'Model Evaluation', 'Accuracy, precision, recall, F1-score'],
            ['Day 6', 'Neural Networks', 'Neurons, layers and activation functions'],
            ['Day 7', 'Final Practice', 'Solve AI/ML interview questions']
        ],

        'Software Developer': [
            ['Day 1', 'Programming Basics', 'Variables, operators and control flow'],
            ['Day 2', 'OOP', 'Classes, objects and inheritance'],
            ['Day 3', 'Data Structures', 'Arrays, stacks, queues, linked lists'],
            ['Day 4', 'Algorithms', 'Searching, sorting and complexity'],
            ['Day 5', 'Database', 'SQL, tables, keys and queries'],
            ['Day 6', 'Software Development', 'SDLC, testing and debugging'],
            ['Day 7', 'Final Practice', 'Solve software developer questions']
        ]
    };

    var selectedRole = document.getElementById('selectedRole');

    if (selectedRole) {
        selectedRole.textContent = role;
    }

    var planContainer =
        document.getElementById('dynamicPreparationPlan');

    if (planContainer) {

        var selectedPlan = plans[role] || plans['Python Developer'];

        planContainer.innerHTML = selectedPlan.map(function(item) {

            return `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">

                        <div class="d-flex align-items-center mb-2">
                            <span class="badge bg-primary me-2">
                                ${item[0]}
                            </span>

                            <h5 class="mb-0">
                                ${item[1]}
                            </h5>
                        </div>

                        <p class="text-muted mb-3">
                            ${item[2]}
                        </p>

                        <label class="d-flex align-items-center gap-2">
                            <input
                                type="checkbox"
                                class="task-checkbox"
                            >
                            <span>Mark this task as completed</span>
                        </label>

                    </div>
                </div>
            `;

        }).join('');
    }

    var practiceContainer =
        document.getElementById('practiceQuestions');

    if (practiceContainer &&
        typeof getTechnicalQuestions === 'function') {

        var questions = getTechnicalQuestions(role);

        practiceContainer.innerHTML =
            '<div class="preparation-section">' +
            '<h4>Practice for ' +
            escapeHTML(role) +
            '</h4>' +

            '<p>Practice questions for your selected role.</p>' +

            questions.slice(0, 10).map(function(q, index) {

                return `
                    <div class="practice-question mb-3">
                        <strong>${index + 1}. </strong>
                        ${escapeHTML(q.text)}

                        <small class="d-block text-muted mt-1">
                            ${escapeHTML(q.topic)}
                            •
                            ${escapeHTML(q.difficulty)}
                        </small>
                    </div>
                `;

            }).join('') +

            '</div>';
    }

    /* Task progress */

    var boxes =
        document.querySelectorAll(
            '#dynamicPreparationPlan .task-checkbox'
        );

    var progressPercent =
        document.getElementById('progressPercent');

    var progressLabel =
        document.getElementById('progressLabel');

    var progressBar =
        document.getElementById('taskProgressBar');

    function updatePreparationProgress() {

        var total = boxes.length;
        var completed = 0;

        boxes.forEach(function(box) {

            if (box.checked) {
                completed++;
            }

        });

        var percent =
            total > 0
                ? Math.round((completed / total) * 100)
                : 0;

        if (progressPercent) {
            progressPercent.textContent = percent + '%';
        }

        if (progressLabel) {
            progressLabel.textContent =
                'Completed: ' +
                completed +
                ' / ' +
                total +
                ' tasks';
        }

        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    }

    boxes.forEach(function(box) {

        box.addEventListener(
            'change',
            updatePreparationProgress
        );

    });

    updatePreparationProgress();
}

// ============================================================
// AUTO START
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        initProfilePage();

        initResumePage();

        initSetupPage();

        initInterviewPage();

        initResultPage();

        initDashboardPage();

        initPreparationPage();

    }
);