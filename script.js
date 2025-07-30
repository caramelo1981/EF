document.addEventListener('DOMContentLoaded', () => {
    // --- GENERAL ELEMENTS ---
    const studentNameInput = document.getElementById('studentNameInput');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentListUl = document.getElementById('studentList');
    const numGroupsInput = document.getElementById('numGroupsInput');
    const generateGroupsBtn = document.getElementById('generateGroupsBtn');
    const groupsDisplayDiv = document.getElementById('groupsDisplay');
    const resetPointsBtn = document.getElementById('resetPointsBtn');
    const duplicateSessionBtn = document.getElementById('duplicateSessionBtn');
    const endSessionBtn = document.getElementById('endSessionBtn');

    // --- CLASS MANAGEMENT ELEMENTS ---
    const classSelect = document.getElementById('classSelect');
    const newClassNameInput = document.getElementById('newClassNameInput');
    const createClassBtn = document.getElementById('createClassBtn');
    const loadClassBtn = document.getElementById('loadClassBtn');
    const currentClassNameDisplay = document.getElementById('currentClassName');
    const currentClassStudentsTitle = document.getElementById('currentClassStudentsTitle');

    // classes: [{ id: 'class_id', name: 'Clase A', students: [{id: 's1', name: 'Juan'}], sessionCount: 0 }]
    let classes = [];
    let currentClassId = null; // ID de la clase actualmente cargada
    // students: Alumnos de la clase actual, incluyendo sessionScore (solo los de la clase cargada)
    let students = [];

    // allTimeStudents: [{ id: 'student_id', name: 'Juan', totalScore: 0 }] - ESTA ES LA LISTA GLOBAL DE ALUMNOS Y SUS PUNTOS ACUMULADOS
    let allTimeStudents = [];

    // sessionsHistory: Historial de sesiones y feedback (cargado/guardado por clase)
    let sessionsHistory = [];
    const sessionHistoryDisplay = document.getElementById('sessionHistoryDisplay');

    // --- MODAL FEEDBACK ELEMENTS ---
    const feedbackModal = document.getElementById('feedbackModal');
    const closeButton = document.querySelector('.close-button');
    const feedbackCategories = document.querySelectorAll('.feedback-category');
    const teacherNotesInput = document.getElementById('teacherNotes');
    const submitFeedbackBtnModal = document.getElementById('submitFeedbackBtnModal');

    let currentSessionFeedback = {
        engagement: null,
        discipline: null,
        enjoyment: null,
        achievement: null,
        notes: '',
        selectedGames: [],
        sessionNumber: 0,
        // NEW: Store session scores for all students at the end of the session
        studentScoresSnapshot: []
    };

    // --- TIMER ELEMENTS ---
    const timerMinutesInput = document.getElementById('timerMinutesInput');
    const timerSecondsInput = document.getElementById('timerSecondsInput');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerBall = document.getElementById('timerBall');
    const boomSound = document.getElementById('boomSound');

    let timerInterval;
    let timeRemaining = 0; // in seconds
    let initialTimeForAnimation = 0; // to calculate inflation percentage
    let isTimerRunning = false;

    // --- GAME FINDER ELEMENTS ---
    const gameCategorySelect = document.getElementById('gameCategorySelect');
    const gameResultsDisplay = document.getElementById('gameResultsDisplay');
    const selectedGamesList = document.getElementById('selectedGamesList');


    // --- GAME DATABASE (15 JUEGOS POR CATEGORÍA) ---
    const gamesDatabase = [
        // --- Lateralidad (15 ejemplos) ---
        { name: "Andar a la pata coja", category: "Lateralidad", description: "Caminar o saltar solo con una pierna, cambiando de lado." },
        { name: "Rayuela (o Tejo)", category: "Lateralidad", description: "Saltar con uno o dos pies, alternando lados, dentro de un patrón dibujado." },
        { name: "Lanzar y atrapar con una mano", category: "Lateralidad", description: "Lanzar una pelota contra una pared y atraparla solo con la mano derecha, luego con la izquierda." },
        { name: "Cruzar la línea", category: "Lateralidad", description: "Alumnos caminan sobre una línea y el profesor da indicaciones de 'derecha' o 'izquierda' para saltar." },
        { name: "Juego del 'Simón Dice' con partes del cuerpo y lateralidad", category: "Lateralidad", description: "Simón dice 'toca tu oreja derecha', 'levanta la mano izquierda'." },
        { name: "Circuito de lateralidad", category: "Lateralidad", description: "Diseñar un circuito donde se requiera alternar movimientos de izquierda y derecha, como pasar un obstáculo por un lado y luego por el otro." },
        { name: "Bailes dirigidos", category: "Lateralidad", description: "Coreografías sencillas donde se especifiquen movimientos a izquierda y derecha (ej. 'paso a la derecha', 'salto a la izquierda')." },
        { name: "Coger objetos con la mano dominante/no dominante", category: "Lateralidad", description: "Juego donde se lanzan objetos y se deben atrapar usando alternativamente la mano dominante y no dominante." },
        { name: "El reloj humano", category: "Lateralidad", description: "Los alumnos forman un círculo y se les pide que giren en el sentido de las agujas del reloj o en sentido contrario." },
        { name: "Juego de espejos con lateralidad", category: "Lateralidad", description: "Dos alumnos frente a frente, uno hace movimientos y el otro lo imita como si fuera su reflejo, prestando atención a la lateralidad." },
        { name: "Tocar partes del cuerpo del compañero (izquierda/derecha)", category: "Lateralidad", description: "En parejas, uno nombra una parte del cuerpo y un lado (ej. 'hombro izquierdo'), y el otro debe tocarla." },
        { name: "Carrera de cangrejos", category: "Lateralidad", description: "Desplazarse como un cangrejo (hacia atrás y de lado), fomentando el uso de ambos lados del cuerpo." },
        { name: "Lanzamiento a canasta con una mano", category: "Lateralidad", description: "Lanzar una pelota a una canasta utilizando solo la mano derecha y luego solo la izquierda." },
        { name: "Saltos asimétricos", category: "Lateralidad", description: "Saltar alternando el pie de impulso, o realizar saltos con giro hacia un lado específico." },
        { name: "Reconocer objetos por el tacto con una mano", category: "Lateralidad", description: "Con los ojos vendados, identificar objetos usando solo la mano izquierda o la derecha." },

        // --- Esquema Corporal (15 ejemplos) ---
        { name: "El espejo", category: "Esquema Corporal", description: "Un alumno hace movimientos lentos y otro lo imita como si fuera su reflejo." },
        { name: "Las estatuas", category: "Esquema Corporal", description: "Mientras suena la música, se mueven; al parar, se quedan inmóviles en una pose." },
        { name: "Dibujar el cuerpo en el suelo", category: "Esquema Corporal", description: "Un alumno se tumba y otro repasa su contorno con tiza." },
        { name: "Caminar como animales", category: "Esquema Corporal", description: "Imitar la forma de andar de diferentes animales (oso, cangrejo, serpiente)." },
        { name: "Puzzle corporal", category: "Esquema Corporal", description: "En grupos, formar con los cuerpos letras o figuras simples." },
        { name: "El robot", category: "Esquema Corporal", description: "Un alumno da instrucciones para mover partes del cuerpo como un robot (ej. 'brazo derecho hacia arriba')." },
        { name: "El juego de las partes del cuerpo", category: "Esquema Corporal", description: "Nombrar partes del cuerpo y que los alumnos las toquen rápidamente." },
        { name: "Dibujar personas con distintas posturas", category: "Esquema Corporal", description: "Dibujar o modelar figuras humanas en diferentes posiciones o expresando emociones con el cuerpo." },
        { name: "Expresar emociones con el cuerpo", category: "Esquema Corporal", description: "Pedir a los alumnos que representen emociones (alegría, tristeza, enfado) solo con su expresión corporal." },
        { name: "Circuito de conocimiento corporal", category: "Esquema Corporal", description: "Un circuito donde cada estación requiere usar una parte específica del cuerpo (ej. 'saltar con los pies juntos', 'tocar el suelo con la mano')." },
        { name: "El titiritero", category: "Esquema Corporal", description: "Un alumno es el 'titiritero' y el otro es la 'marioneta', que se mueve según las indicaciones del primero." },
        { name: "Crear figuras con el cuerpo en grupo", category: "Esquema Corporal", description: "Varios alumnos se unen para formar figuras más complejas, como un coche, una casa, etc." },
        { name: "Adelante, atrás, arriba, abajo (con movimientos)", category: "Esquema Corporal", description: "Dar indicaciones espaciales y que los alumnos las representen con movimientos de su cuerpo." },
        { name: "El detective del cuerpo", category: "Esquema Corporal", description: "Observar las posturas de los compañeros e intentar adivinar qué están haciendo o sintiendo." },
        { name: "Juego de la silueta", category: "Esquema Corporal", description: "Dibujar la silueta de un compañero y luego identificar las diferentes partes del cuerpo." },

        // --- Fuerza (15 ejemplos) ---
        { name: "Carrera de sacos", category: "Fuerza", description: "Los participantes saltan dentro de sacos. Fortalece las piernas." },
        { name: "Soga-tira (Tira y afloja)", category: "Fuerza", description: "Dos equipos tiran de una cuerda. Desarrolla la fuerza general." },
        { name: "Carrera de carretillas", category: "Fuerza", description: "Un alumno camina con las manos mientras otro le sujeta las piernas." },
        { name: "Flexiones de brazos (adaptadas)", category: "Fuerza", description: "Apoyando rodillas si es necesario. Fortalece pectorales, hombros y tríceps." },
        { name: "Lanzamiento de balón medicinal (ligero)", category: "Fuerza", description: "Lanzar un balón medicinal ligero con dos manos por encima de la cabeza." },
        { name: "Empujar paredes o compañeros (con seguridad)", category: "Fuerza", description: "Ejercicios de empuje contra una pared o de empuje suave con un compañero para resistencia." },
        { name: "Saltos de rana", category: "Fuerza", description: "Saltar agachado, imitando una rana. Fortalece piernas y glúteos." },
        { name: "Transporte de objetos pesados (seguros)", category: "Fuerza", description: "Mover objetos no dañinos y de peso adecuado, como sacos de arena pequeños o bloques de espuma." },
        { name: "Circuito de estaciones de fuerza", category: "Fuerza", description: "Organizar estaciones con diferentes ejercicios que requieran fuerza (ej. subir escaleras, saltar obstáculos)." },
        { name: "Juego de la silla", category: "Fuerza", description: "Sentarse en el aire con la espalda contra la pared, manteniendo la postura." },
        { name: "Cuerdas para trepar (adaptado)", category: "Fuerza", description: "Ejercicios de tracción o trepa en cuerdas o espalderas, con asistencia si es necesario." },
        { name: "Pase de pecho con balón pesado", category: "Fuerza", description: "Pasar un balón medicinal o de baloncesto pesado con fuerza utilizando ambos brazos." },
        { name: "Saltos verticales", category: "Fuerza", description: "Saltar lo más alto posible, desarrollando la fuerza explosiva de las piernas." },
        { name: "Elevación de piernas (colgado o tumbado)", category: "Fuerza", description: "Desde una barra o tumbados, levantar las piernas para fortalecer el abdomen." },
        { name: "Lagartijas (con apoyo de rodillas)", category: "Fuerza", description: "Variación de flexiones que permite enfocar la fuerza en los brazos y el pecho." },

        // --- Velocidad (15 ejemplos) ---
        { name: "Pilla-pilla o la peste", category: "Velocidad", description: "Juego clásico de persecución que requiere velocidad y agilidad." },
        { name: "Carrera de velocidad lineal", category: "Velocidad", description: "Sprints cortos en línea recta. Entrenamiento puro de velocidad máxima." },
        { name: "Reacción a señal sonora/visual", category: "Velocidad", description: "Salir corriendo o cambiar de dirección rápidamente al escuchar un silbato o ver una señal." },
        { name: "Juego del pañuelo", category: "Velocidad", description: "Dos equipos, los jugadores con el mismo número corren para coger un pañuelo." },
        { name: "Carrera de ida y vuelta (shuttle run)", category: "Velocidad", description: "Correr distancias cortas de ida y vuelta tocando una línea." },
        { name: "Circuito de agilidad con conos", category: "Velocidad", description: "Correr en zig-zag entre conos, cambiando de dirección rápidamente." },
        { name: "Salida de tacos (simulada)", category: "Velocidad", description: "Practicar salidas rápidas desde una posición agachada o sentada." },
        { name: "Robar la cola", category: "Velocidad", description: "Cada jugador lleva un pañuelo 'cola' y debe intentar robar las colas de los demás sin perder la suya." },
        { name: "Carrera de relevos", category: "Velocidad", description: "Equipos que compiten pasando un testigo. Requiere velocidad y coordinación en el pase." },
        { name: "El cazador y la presa", category: "Velocidad", description: "Un alumno persigue a los demás, que deben correr y esquivar para no ser atrapados." },
        { name: "Carrera de obstáculos rápida", category: "Velocidad", description: "Diseñar un recorrido con pequeños obstáculos que los alumnos deben superar a la máxima velocidad posible." },
        { name: "Atrápame si puedes", category: "Velocidad", description: "Un juego de persecución donde los jugadores deben atrapar a un compañero en un espacio limitado." },
        { name: "Juego de la 'mancha' con variaciones", category: "Velocidad", description: "Mancha donde el 'que pilla' debe tocar solo una parte del cuerpo o debe arrastrarse, aumentando el reto." },
        { name: "Esquivar objetos lanzados", category: "Velocidad", description: "Eludir pelotas blandas o pañuelos lanzados por un compañero, desarrollando reflejos y velocidad de reacción." },
        { name: "Carreras con inicio y parada rápida", category: "Velocidad", description: "Correr a velocidad máxima, y al escuchar una señal, detenerse o cambiar de dirección lo más rápido posible." },

        // --- Juegos Populares (15 ejemplos) ---
        { name: "Escondite", category: "Juegos Populares", description: "Un jugador cuenta mientras los demás se esconden. Luego busca a los escondidos." },
        { name: "La gallinita ciega", category: "Juegos Populares", description: "Un jugador con los ojos vendados intenta atrapar a los demás." },
        { name: "Saltar a la comba", category: "Juegos Populares", description: "Individualmente o en grupo, saltar una cuerda que se gira." },
        { name: "Las cuatro esquinas", category: "Juegos Populares", description: "Cuatro jugadores en las esquinas, uno en el centro. Intentan cambiar sin ser pillados." },
        { name: "Balón prisionero", category: "Juegos Populares", description: "Dos equipos. Intentan eliminar a los jugadores del equipo contrario lanzando un balón." },
        { name: "La cuerda", category: "Juegos Populares", description: "Juego de saltar la cuerda con varias personas a la vez o con dos que la mueven." },
        { name: "La serpiente", category: "Juegos Populares", description: "Un grupo de alumnos se coge de las manos y se mueve como una serpiente, intentando no soltarse." },
        { name: "Piedra, papel o tijera (a gran escala)", category: "Juegos Populares", description: "Versión del juego clásico donde los alumnos representan los elementos con todo el cuerpo." },
        { name: "El rey de la colina", category: "Juegos Populares", description: "Un jugador intenta mantenerse en una posición elevada mientras los demás intentan desplazarlo." },
        { name: "El lobo y las ovejas", category: "Juegos Populares", description: "Un 'lobo' persigue a las 'ovejas' en un espacio limitado, intentando atraparlas." },
        { name: "Carrera de cucharas y huevos", category: "Juegos Populares", description: "Los participantes deben correr llevando un huevo (o una pelota) en una cuchara sin que se caiga." },
        { name: "Bote, bote", category: "Juegos Populares", description: "Similar al escondite, pero el que cuenta debe golpear un bote cada vez que encuentra a alguien." },
        { name: "El semáforo", category: "Juegos Populares", description: "Un jugador de espaldas dice 'luz verde' (corren) y 'luz roja' (se quedan quietos). Si se mueven en luz roja, vuelven al inicio." },
        { name: "Juego de la silla musical", category: "Juegos Populares", description: "Alrededor de sillas, los jugadores caminan con la música y se sientan al parar. Siempre hay una silla menos que jugadores." },
        { name: "La cadena", category: "Juegos Populares", description: "Un jugador persigue y, al atrapar a alguien, se unen de la mano para seguir persiguiendo a otros." },

        // --- Coordinación (15 ejemplos) ---
        { name: "Malabares con pañuelos/pelotas", category: "Coordinación", description: "Lanzar y atrapar varios objetos al mismo tiempo. Mejora la coordinación óculo-manual." },
        { name: "Saltar la cuerda con patrones", category: "Coordinación", description: "Saltar a la comba de diferentes formas (con un pie, cruzado, hacia atrás)." },
        { name: "Juego de ritmo con palmadas", category: "Coordinación", description: "Seguir un patrón rítmico con palmadas en diferentes partes del cuerpo o con un compañero." },
        { name: "Botar y pasar un balón", category: "Coordinación", description: "Botar un balón y pasarlo a un compañero mientras se mueve." },
        { name: "Driblar un balón con ambas manos/pies", category: "Coordinación", description: "Practicar el dribling de balón con la mano derecha, luego la izquierda; o con el pie derecho, luego el izquierdo." },
        { name: "Lanzamiento a diana con precisión", category: "Coordinación", description: "Lanzar pelotas o aros a un objetivo fijo o en movimiento." },
        { name: "Circuito de coordinación motriz", category: "Coordinación", description: "Recorrido con actividades como gatear, saltar, girar, pasar por debajo o por encima de objetos." },
        { name: "Caminar sobre líneas marcadas", category: "Coordinación", description: "Andar siguiendo patrones complejos en el suelo (curvas, zig-zag, espirales)." },
        { name: "Bailes con coreografía", category: "Coordinación", description: "Aprender y ejecutar secuencias de pasos de baile, mejorando la coordinación general." },
        { name: "Juego de 'simón dice' con movimientos complejos", category: "Coordinación", description: "Simón dice 'toca tu nariz con la mano izquierda mientras saltas en un pie'." },
        { name: "Pasar objetos en cadena (sin manos)", category: "Coordinación", description: "Pasar objetos de un compañero a otro usando solo los pies, la cabeza o el tronco." },
        { name: "Carrera de vallas bajas", category: "Coordinación", description: "Saltar pequeñas vallas o obstáculos rítmicamente." },
        { name: "Pase y recepción de objetos variados", category: "Coordinación", description: "Lanzar y atrapar objetos de diferentes formas y tamaños (pañuelos, aros, pelotas pequeñas)." },
        { name: "Juegos con raquetas y pelotas (bádminton, tenis de mesa)", category: "Coordinación", description: "Golpear una pelota con una raqueta, mejorando la coordinación óculo-manual y el control." },
        { name: "Relevos con tareas coordinativas", category: "Coordinación", description: "Carreras de relevos donde cada participante debe completar una tarea de coordinación antes de pasar el testigo." },

        // --- Equilibrio (15 ejemplos) ---
        { name: "Caminar sobre una línea recta (en el suelo)", category: "Equilibrio", description: "Andar sin salirse de una línea pintada o marcada." },
        { name: "Aguantar a la pata coja", category: "Equilibrio", description: "Mantenerse de pie sobre una pierna el mayor tiempo posible." },
        { name: "Equilibrio con objetos en la cabeza", category: "Equilibrio", description: "Caminar llevando un saco de semillas o un libro en la cabeza sin que se caiga." },
        { name: "El árbol (postura de yoga)", category: "Equilibrio", description: "Mantenerse de pie sobre una pierna, con la planta del otro pie apoyada en el muslo." },
        { name: "Caminar de puntillas o de talones", category: "Equilibrio", description: "Moverse manteniendo el equilibrio sobre las puntas de los pies o los talones." },
        { name: "Circuito de equilibrio", category: "Equilibrio", description: "Pasarelas, pufs, cuerdas o bancos para caminar sin caerse." },
        { name: "Equilibrio en un pie con ojos cerrados", category: "Equilibrio", description: "Mantener la postura a la pata coja con los ojos cerrados para aumentar la dificultad." },
        { name: "Juego de la 'estatua' con una pierna", category: "Equilibrio", description: "Congelarse en una postura de equilibrio al detenerse la música." },
        { name: "Transportar objetos inestables", category: "Equilibrio", description: "Llevar un vaso de agua o una torre de bloques sin que se caigan mientras se camina." },
        { name: "Caminar hacia atrás sobre una línea", category: "Equilibrio", description: "Desplazarse de espaldas sobre una línea, lo que desafía el equilibrio de una forma diferente." },
        { name: "Equilibrio dinámico en un balón suizo (con ayuda)", category: "Equilibrio", description: "Sentarse o intentar ponerse de rodillas sobre un balón suizo con supervisión." },
        { name: "Movimientos de taichí o 'sombras chinas'", category: "Equilibrio", description: "Realizar movimientos lentos y fluidos que requieren control postural y equilibrio." },
        { name: "Juego de 'el cocodrilo' (en colchonetas flotantes)", category: "Equilibrio", description: "Moverse entre colchonetas que simulan islotes en un 'río' sin caerse al agua." },
        { name: "Empujar suavemente a un compañero en equilibrio", category: "Equilibrio", description: "En parejas, uno mantiene una postura de equilibrio y el otro le da pequeños empujes para que intente resistir." },
        { name: "Posturas de animales (con una o dos patas)", category: "Equilibrio", description: "Imitar animales que se apoyan en pocos puntos (ej. flamenco, cigüeña)." },

        // --- Juegos Cooperativos (15 ejemplos) ---
        { name: "La tela de araña cooperativa", category: "Juegos Cooperativos", description: "Un grupo forma una 'tela de araña' con cuerdas o brazos, y los demás deben pasar sin tocar la 'tela'." },
        { name: "Transporte de 'heridos'", category: "Juegos Cooperativos", description: "En grupos, transportar a un compañero simulando que está 'herido'." },
        { name: "El nudo humano", category: "Juegos Cooperativos", description: "En círculo, cada uno coge dos manos de dos personas diferentes, y el grupo debe desenredarse sin soltarse." },
        { name: "Pasar la pelota sin usar las manos", category: "Juegos Cooperativos", description: "En círculo, pasar una pelota de un compañero a otro usando solo los pies, la cabeza, los hombros, etc." },
        { name: "Caminar ciegos y guiados", category: "Juegos Cooperativos", description: "Por parejas, uno con los ojos vendados y el otro lo guía verbalmente por un recorrido de obstáculos." },
        { name: "Construcción cooperativa (torre, puente)", category: "Juegos Cooperativos", description: "En equipos, construir una estructura usando materiales limitados, donde todos deben colaborar." },
        { name: "La oruga humana", category: "Juegos Cooperativos", description: "Los alumnos se colocan uno detrás de otro agarrados por los tobillos y avanzan como una oruga." },
        { name: "Rescate de objetos", category: "Juegos Cooperativos", description: "Un objeto está 'atrapado' en un área y el grupo debe ingeniárselas para recuperarlo sin entrar en ella." },
        { name: "El círculo de la confianza", category: "Juegos Cooperativos", description: "Un alumno se deja caer hacia atrás en el centro de un círculo, confiando en que los demás lo sostendrán." },
        { name: "El muro invisible", category: "Juegos Cooperativos", description: "Los alumnos deben ayudarse mutuamente a 'trepar' un muro imaginario, levantándose uno a uno." },
        { name: "Cruzando el río", category: "Juegos Cooperativos", description: "Un grupo debe cruzar un 'río' usando un número limitado de 'piedras' (colchonetas o papeles)." },
        { name: "El balón viajero", category: "Juegos Cooperativos", description: "Mantener un balón en el aire el mayor tiempo posible tocándolo entre todos sin dejarlo caer." },
        { name: "Cazar al dragón", category: "Juegos Cooperativos", description: "Formar una fila donde el último es la 'cola' y el primero intenta atraparla mientras todos se mueven juntos." },
        { name: "Puzzle gigante cooperativo", category: "Juegos Cooperativos", description: "Resolver un puzzle grande entre todo el grupo, donde cada uno aporta una pieza." },
        { name: "La manta voladora", category: "Juegos Cooperativos", description: "En grupos, usar una manta para mover una pelota de un punto a otro sin que se caiga." },

        // --- Vuelta a la Calma (15 ejemplos) ---
        { name: "Respiración profunda (con peluches en el abdomen)", category: "Vuelta a la Calma", description: "Tumbados, colocar un peluche en el abdomen y observar cómo sube y baja." },
        { name: "Estiramientos suaves guiados", category: "Vuelta a la Calma", description: "Realizar estiramientos lentos y conscientes, enfocándose en la sensación." },
        { name: "Masaje de espalda en cadena", category: "Vuelta a la Calma", description: "Sentados en fila, cada uno masajea suavemente la espalda del compañero de delante." },
        { name: "Audición musical (música clásica o relajante)", category: "Vuelta a la Calma", description: "Escuchar una pieza musical con los ojos cerrados, prestando atención a los sonidos." },
        { name: "Pompas de jabón", category: "Vuelta a la Calma", description: "Soplar pompas de jabón. La concentración en el soplido es relajante." },
        { name: "Juego del hielo derretido", category: "Vuelta a la Calma", description: "Los alumnos se 'congelan' y lentamente se 'derriten' hasta el suelo, relajando los músculos." },
        { name: "Relajación progresiva de Jacobson (simplificada)", category: "Vuelta a la Calma", description: "Tensar y relajar diferentes grupos musculares, sintiendo la diferencia." },
        { name: "Dibujo libre con música relajante", category: "Vuelta a la Calma", description: "Dibujar sin un objetivo específico mientras se escucha música tranquila." },
        { name: "Caminar lento y consciente", category: "Vuelta a la Calma", description: "Pasear despacio, prestando atención a cada paso, la respiración y el entorno." },
        { name: "Visualización guiada", category: "Vuelta a la Calma", description: "Imaginar un lugar tranquilo y agradable con los ojos cerrados, siguiendo las indicaciones del profesor." },
        { name: "El abrazo del oso", category: "Vuelta a la Calma", description: "Abrazar a un compañero o a uno mismo, apretando y luego relajando." },
        { name: "Juego de las 'nubes'", category: "Vuelta a la Calma", description: "Tumbados, observar las nubes (reales o imaginarias) y darles formas." },
        { name: "Tocar suavemente objetos con diferentes texturas", category: "Vuelta a la Calma", description: "Explorar la sensación de texturas suaves, rugosas, frías, etc., de forma consciente." },
        { name: "Cuentacuentos relajante", category: "Vuelta a la Calma", description: "Escuchar un cuento narrado en voz baja y con un tono tranquilizador." },
        { name: "Movimientos lentos al ritmo de la música", category: "Vuelta a la Calma", description: "Realizar movimientos muy lentos y fluidos, como un baile lento o un tai chi simple, al compás de música suave." }
    ];

    // --- UTILITY FUNCTIONS ---
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function saveToLocalStorage() {
        localStorage.setItem('classes', JSON.stringify(classes));
        localStorage.setItem('allTimeStudents', JSON.stringify(allTimeStudents));
    }

    function loadFromLocalStorage() {
        const storedClasses = localStorage.getItem('classes');
        if (storedClasses) {
            classes = JSON.parse(storedClasses);
            populateClassSelect();
        }

        const storedAllTimeStudents = localStorage.getItem('allTimeStudents');
        if (storedAllTimeStudents) {
            allTimeStudents = JSON.parse(storedAllTimeStudents);
        }
    }

    function populateClassSelect() {
        classSelect.innerHTML = '<option value="">Cargar o Crear Clase...</option>';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
    }

    function renderStudents() {
        studentListUl.innerHTML = '';
        if (students.length === 0) {
            studentListUl.innerHTML = '<li class="initial-message">No hay alumnos en esta clase aún.</li>';
            return;
        }
        students.forEach(student => {
            const li = document.createElement('li');
            li.setAttribute('data-id', student.id);
            // Find the student in the global allTimeStudents list to get their totalScore
            const allTimeStudent = allTimeStudents.find(s => s.id === student.id);
            const totalPoints = allTimeStudent ? allTimeStudent.totalScore : 0; // Use 0 if not found (shouldn't happen with correct flow)

            li.innerHTML = `
                <span class="student-name">${student.name}</span>
                <div class="score-controls">
                    <button class="decrease-score-btn" data-id="${student.id}">-</button>
                    <span class="points-display" data-id="${student.id}">${student.sessionScore}</span>
                    <button class="increase-score-btn" data-id="${student.id}">+</button>
                    <button class="remove-student-btn" data-id="${student.id}">✖</button>
                </div>
                <div class="total-points">Total Acumulado: ${totalPoints} puntos</div>
            `;
            studentListUl.appendChild(li);
        });
        attachStudentListListeners();
    }

    function attachStudentListListeners() {
        document.querySelectorAll('.increase-score-btn').forEach(button => {
            button.onclick = (e) => {
                const studentId = e.target.dataset.id;
                updateStudentScore(studentId, 1);
            };
        });
        document.querySelectorAll('.decrease-score-btn').forEach(button => {
            button.onclick = (e) => {
                const studentId = e.target.dataset.id;
                updateStudentScore(studentId, -1);
            };
        });
        document.querySelectorAll('.remove-student-btn').forEach(button => {
            button.onclick = (e) => {
                const studentId = e.target.dataset.id;
                removeStudent(studentId);
            };
        });
    }

    function updateStudentScore(studentId, change) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            student.sessionScore = Math.max(0, student.sessionScore + (change * 2.5));
            document.querySelector(`.points-display[data-id="${studentId}"]`).textContent = student.sessionScore;
            // No se actualiza el totalScore aquí, solo el sessionScore.
            // El totalScore se actualiza al finalizar la sesión.
        }
    }

    function removeStudent(studentId) {
        if (!currentClassId) {
            alert('No hay una clase cargada. No se puede eliminar el alumno.');
            return;
        }

        const studentToRemove = students.find(s => s.id === studentId);
        if (!studentToRemove) {
            console.warn('Attempted to remove a student not found in current session students:', studentId);
            return;
        }

        if (confirm(`¿Estás seguro de que quieres eliminar a "${studentToRemove.name}" de esta clase? Esto borrará sus puntos acumulados.`)) {
            // Remove student from the current class's active student list if loaded
            students = students.filter(s => s.id !== studentId);

            // Find the class in the global classes array and remove the student from its student list
            const currentClassObj = classes.find(cls => cls.id === currentClassId);
            if (currentClassObj) {
                currentClassObj.students = currentClassObj.students.filter(s => s.id !== studentId);
            }

            // Remove student from allTimeStudents list permanently
            allTimeStudents = allTimeStudents.filter(s => s.id !== studentId);

            renderStudents(); // Re-render to reflect removal
            saveToLocalStorage(); // Save updated classes (with student removed) and allTimeStudents
            alert(`"${studentToRemove.name}" ha sido eliminado. Sus puntos también han sido eliminados de su historial total.`);
        }
    }


    function saveCurrentClassStudents() {
        if (currentClassId) {
            const currentClassIndex = classes.findIndex(cls => cls.id === currentClassId);
            if (currentClassIndex !== -1) {
                // Save only id and name for the class's student list.
                // sessionScore is temporary and resets per session.
                classes[currentClassIndex].students = students.map(s => ({
                    id: s.id,
                    name: s.name,
                }));
                saveToLocalStorage(); // This will save the updated classes array
            }
        }
    }

    function clearStudentListDisplay() {
        studentListUl.innerHTML = '<li class="initial-message">No hay alumnos en esta clase aún.</li>';
        groupsDisplayDiv.innerHTML = '<p class="initial-message">Los grupos aparecerán aquí.</p>';
        selectedGamesList.innerHTML = '<li class="no-games-selected">No hay juegos seleccionados aún.</li>';
        sessionHistoryDisplay.innerHTML = '<p class="initial-message">Aquí aparecerán tus sesiones guardadas.</p>';
        currentSessionFeedback.selectedGames = [];
        currentSessionFeedback.studentScoresSnapshot = []; // Clear snapshot too
    }

    function loadClass(classId) {
        const selectedClass = classes.find(cls => cls.id === classId);
        if (selectedClass) {
            currentClassId = classId;
            // Deep copy students from the class's saved list, ensuring sessionScore starts at 0 for a new session
            // We retrieve names from the class's student list, but the totalScore comes from allTimeStudents
            students = selectedClass.students.map(classStudent => ({
                id: classStudent.id,
                name: classStudent.name,
                sessionScore: 0 // Always reset session score on class load
            }));

            currentClassNameDisplay.textContent = `Clase Cargada: ${selectedClass.name}`;
            currentClassStudentsTitle.textContent = `Alumnos de ${selectedClass.name}`;
            renderStudents(); // This will now correctly display both sessionScore (0) and totalScore
            loadSessionHistoryForClass(classId);
            resetCurrentSessionFeedback(); // Reset games and feedback state when new class loaded
        } else {
            alert('Error: No se encontró la clase seleccionada. Por favor, crea o carga una clase válida.');
            currentClassId = null;
            students = [];
            currentClassNameDisplay.textContent = 'Ninguna Clase Cargada';
            currentClassStudentsTitle.textContent = 'Alumnos de la Sesión Actual';
            clearStudentListDisplay();
            sessionsHistory = []; // Clear history if no class is loaded
        }
    }

    function loadSessionHistoryForClass(classId) {
        const storedHistory = localStorage.getItem(`sessionsHistory_${classId}`);
        if (storedHistory) {
            sessionsHistory = JSON.parse(storedHistory);
        } else {
            sessionsHistory = [];
        }
        renderSessionHistory();
    }

    function saveSessionHistoryForClass(classId) {
        if (classId) {
            localStorage.setItem(`sessionsHistory_${classId}`, JSON.stringify(sessionsHistory));
        }
    }


    // --- EVENT LISTENERS ---

    // Class Management
    createClassBtn.addEventListener('click', () => {
        const newClassName = newClassNameInput.value.trim();
        if (newClassName) {
            // Check if a class with the exact same name already exists
            const existingClass = classes.find(cls => cls.name.toLowerCase() === newClassName.toLowerCase());
            if (existingClass) {
                alert('Ya existe una clase con ese nombre. Por favor, elige un nombre diferente.');
                return;
            }

            const newClass = {
                id: generateUniqueId(),
                name: newClassName,
                students: [], // No sessionScore needed here, as it's per-session
                sessionCount: 0
            };
            classes.push(newClass);
            saveToLocalStorage();
            populateClassSelect();
            newClassNameInput.value = '';
            alert(`Clase "${newClassName}" creada con éxito.`);
            // Automatically load the newly created class
            classSelect.value = newClass.id;
            loadClass(newClass.id);
        } else {
            alert('Por favor, introduce un nombre para la nueva clase.');
        }
    });

    loadClassBtn.addEventListener('click', () => {
        const selectedClassId = classSelect.value;
        if (selectedClassId) {
            loadClass(selectedClassId);
        } else {
            alert('Por favor, selecciona una clase para cargar.');
        }
    });


    // Student Management
    addStudentBtn.addEventListener('click', () => {
        if (!currentClassId) {
            alert('Por favor, carga o crea una clase primero antes de añadir alumnos.');
            return;
        }
        const studentName = studentNameInput.value.trim();
        if (studentName) {
            // Check if student already exists in the current class's active student list by name
            if (students.some(s => s.name.toLowerCase() === studentName.toLowerCase())) {
                alert('Ya existe un alumno con ese nombre en esta clase.');
                return;
            }

            const newStudentId = generateUniqueId();
            const newStudent = { id: newStudentId, name: studentName, sessionScore: 0 };
            students.push(newStudent);

            // Add to allTimeStudents list if they are truly new (check ID)
            // Or ensure their name is consistent if ID somehow pre-exists but name is different.
            let existingAllTimeStudent = allTimeStudents.find(s => s.id === newStudentId);
            if (!existingAllTimeStudent) {
                allTimeStudents.push({ id: newStudentId, name: studentName, totalScore: 0 });
            } else {
                existingAllTimeStudent.name = studentName; // Update name in allTimeStudents if ID matches but name differs
            }

            renderStudents();
            saveCurrentClassStudents(); // Save students to the current class structure in 'classes' array
            saveToLocalStorage(); // Save global allTimeStudents and classes
            studentNameInput.value = '';
        } else {
            alert('Por favor, introduce el nombre del alumno.');
        }
    });

    resetPointsBtn.addEventListener('click', () => {
        if (!currentClassId) {
            alert('Por favor, carga una clase primero.');
            return;
        }
        if (confirm('¿Estás seguro de que quieres reiniciar los puntos de sesión para todos los alumnos? Los puntos acumulados NO se verán afectados.')) {
            students.forEach(student => student.sessionScore = 0);
            renderStudents();
            alert('Puntos de sesión reiniciados.');
        }
    });

    duplicateSessionBtn.addEventListener('click', () => {
        if (!currentClassId) {
            alert('Por favor, carga una clase primero.');
            return;
        }
        if (confirm('¿Quieres duplicar la sesión actual para mañana? Esto reiniciará los puntos de sesión actuales y deseleccionará los juegos.')) {
            students.forEach(student => student.sessionScore = 0);
            renderStudents();
            resetCurrentSessionFeedback(); // Resets feedback fields and clears selected games
            alert('Sesión duplicada para mañana. Puntos reiniciados y juegos deseleccionados.');
        }
    });

    endSessionBtn.addEventListener('click', () => {
        if (!currentClassId) {
            alert('Por favor, carga una clase primero para finalizar una sesión.');
            return;
        }
        feedbackModal.style.display = 'flex';
    });

    // --- Feedback Modal Logic ---
    closeButton.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
        resetFeedbackForm();
    });

    window.addEventListener('click', (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
            resetFeedbackForm();
        }
    });

    feedbackCategories.forEach(categoryDiv => {
        categoryDiv.querySelectorAll('.emoji').forEach(emoji => {
            emoji.addEventListener('click', (e) => {
                Array.from(e.target.parentNode.children).forEach(sibling => {
                    sibling.classList.remove('selected');
                });
                e.target.classList.add('selected');
                const category = e.target.closest('.feedback-category').dataset.category;
                currentSessionFeedback[category] = parseInt(e.target.dataset.value);
            });
        });
    });

    submitFeedbackBtnModal.addEventListener('click', () => {
        if (!currentClassId) {
            alert('No hay una clase cargada para guardar el feedback de la sesión.');
            return;
        }

        const feedbackKeys = ['engagement', 'discipline', 'enjoyment', 'achievement'];
        for (let key of feedbackKeys) {
            if (currentSessionFeedback[key] === null) {
                // Improved user feedback for missing evaluation
                const categoryName = {
                    engagement: 'Compromiso',
                    discipline: 'Disciplina',
                    enjoyment: 'Disfrute',
                    achievement: 'Logro de Objetivos'
                }[key];
                alert(`Por favor, evalúa el aspecto de "${categoryName}" antes de finalizar la sesión.`);
                return;
            }
        }

        // NEW: Capture a snapshot of current session scores before they are reset
        currentSessionFeedback.studentScoresSnapshot = students.map(s => ({
            id: s.id,
            name: s.name,
            score: s.sessionScore
        }));

        // Update total scores for students based on current session scores
        students.forEach(sessionStudent => {
            // Find the student in the global allTimeStudents list
            const globalStudent = allTimeStudents.find(s => s.id === sessionStudent.id);
            if (globalStudent) {
                globalStudent.totalScore = (globalStudent.totalScore || 0) + sessionStudent.sessionScore;
            } else {
                // This case should ideally not happen if students are added correctly,
                // but as a fallback, add them with their sessionScore as initial totalScore.
                allTimeStudents.push({ id: sessionStudent.id, name: sessionStudent.name, totalScore: sessionStudent.sessionScore });
            }
        });

        // Increment session count for the current class
        const currentClass = classes.find(cls => cls.id === currentClassId);
        if (currentClass) {
            currentClass.sessionCount = (currentClass.sessionCount || 0) + 1;
        }

        // Add the session number and other details to the feedback
        currentSessionFeedback.sessionNumber = currentClass ? currentClass.sessionCount : 0;
        currentSessionFeedback.notes = teacherNotesInput.value.trim();
        currentSessionFeedback.date = new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' });

        sessionsHistory.push({ ...currentSessionFeedback }); // Push a copy of the current feedback state
        saveSessionHistoryForClass(currentClassId);
        saveToLocalStorage(); // Saves updated allTimeStudents AND classes (with new sessionCount)

        // Reset for next session
        students.forEach(student => student.sessionScore = 0); // Reset session scores for students
        renderStudents(); // Re-render to show reset session scores and UPDATED total scores
        resetCurrentSessionFeedback(); // Reset the feedback form data AND clear selected games
        feedbackModal.style.display = 'none';
        resetFeedbackForm(); // Clear the modal form visuals

        alert('Sesión finalizada y feedback guardado con éxito. Puntos de sesión reiniciados y puntos totales actualizados.');
        renderSessionHistory(); // Update the displayed history
    });

    function resetFeedbackForm() {
        feedbackCategories.forEach(categoryDiv => {
            categoryDiv.querySelectorAll('.emoji').forEach(emoji => {
                emoji.classList.remove('selected');
            });
        });
        teacherNotesInput.value = '';
    }

    function resetCurrentSessionFeedback() {
        currentSessionFeedback = {
            engagement: null,
            discipline: null,
            enjoyment: null,
            achievement: null,
            notes: '',
            selectedGames: [],
            sessionNumber: 0,
            studentScoresSnapshot: [] // Reset snapshot
        };
        renderSelectedGames(); // Ensure selected games list is cleared visually
    }


    // --- Group Generator Logic ---
    generateGroupsBtn.addEventListener('click', () => {
        if (!currentClassId || students.length === 0) {
            alert('Carga una clase con alumnos para generar grupos.');
            return;
        }

        const numGroups = parseInt(numGroupsInput.value);
        if (isNaN(numGroups) || numGroups < 2 || numGroups > students.length) {
            alert('Introduce un número válido de grupos (entre 2 y el número total de alumnos).');
            return;
        }

        const shuffledStudents = [...students].sort(() => Math.random() - 0.5); // Shuffle students
        const groups = Array.from({ length: numGroups }, () => []);

        shuffledStudents.forEach((student, index) => {
            groups[index % numGroups].push(student.name);
        });

        groupsDisplayDiv.innerHTML = '';
        groups.forEach((group, index) => {
            const groupCard = document.createElement('div');
            groupCard.classList.add('group-card');
            groupCard.innerHTML = `
                <h3>Grupo ${index + 1}</h3>
                <ul>
                    ${group.map(studentName => `<li>${studentName}</li>`).join('')}
                </ul>
            `;
            groupsDisplayDiv.appendChild(groupCard);
        });
    });


    // --- Game Finder Logic ---
    gameCategorySelect.addEventListener('change', filterGames);

    function filterGames() {
        const selectedCategory = gameCategorySelect.value;
        const filteredGames = selectedCategory
            ? gamesDatabase.filter(game => game.category === selectedCategory)
            : [];

        renderGames(filteredGames);
    }

    function renderGames(games) {
        gameResultsDisplay.innerHTML = '';
        if (games.length === 0 && gameCategorySelect.value !== '') {
            gameResultsDisplay.innerHTML = '<p class="initial-message">No se encontraron juegos para esta categoría.</p>';
            return;
        } else if (gameCategorySelect.value === '') {
             gameResultsDisplay.innerHTML = '<p class="initial-message">Selecciona una categoría para ver los juegos.</p>';
             return;
        }

        games.forEach(game => {
            const gameItem = document.createElement('div');
            gameItem.classList.add('game-item');
            gameItem.innerHTML = `
                <h3>${game.name}</h3>
                <p>${game.description}</p>
                <button class="add-game-to-session-btn" data-game-name="${game.name}">Añadir a la Sesión</button>
            `;
            gameResultsDisplay.appendChild(gameItem);
        });
        attachAddGameListeners();
    }

    function attachAddGameListeners() {
        document.querySelectorAll('.add-game-to-session-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const gameName = e.target.dataset.gameName;
                addGameToCurrentSession(gameName);
            });
        });
    }

    function addGameToCurrentSession(gameName) {
        if (!currentSessionFeedback.selectedGames.includes(gameName)) {
            currentSessionFeedback.selectedGames.push(gameName);
            renderSelectedGames();
        } else {
            alert('Este juego ya ha sido añadido a la sesión.');
        }
    }

    function renderSelectedGames() {
        selectedGamesList.innerHTML = '';
        if (currentSessionFeedback.selectedGames.length === 0) {
            selectedGamesList.innerHTML = '<li class="no-games-selected">No hay juegos seleccionados aún.</li>';
            return;
        }
        currentSessionFeedback.selectedGames.forEach(gameName => {
            const li = document.createElement('li');
            li.textContent = gameName;
            selectedGamesList.appendChild(li);
        });
    }


    // --- Session History Logic ---
    function renderSessionHistory() {
        sessionHistoryDisplay.innerHTML = '';
        if (sessionsHistory.length === 0) {
            sessionHistoryDisplay.innerHTML = '<p class="initial-message">Aquí aparecerán tus sesiones guardadas.</p>';
            return;
        }

        // Sort by session number for consistent ordering
        sessionsHistory.sort((a, b) => (a.sessionNumber || 0) - (b.sessionNumber || 0));

        sessionsHistory.forEach((session, index) => {
            const sessionCard = document.createElement('div');
            sessionCard.classList.add('session-card');
            // Using a data-index based on the array position AFTER sorting for deletion purposes
            sessionCard.setAttribute('data-actual-index', index);

            const getEmoji = (value) => {
                if (value === 5) return { emoji: '😀', class: 'excellent' };
                if (value === 4) return { emoji: '🙂', class: 'good' };
                if (value === 3) return { emoji: '😐', class: 'average' };
                if (value === 2) return { emoji: '🙁', class: 'bad' };
                if (value === 1) return { emoji: '😡', class: 'terrible' };
                return { emoji: '❓', class: 'unknown' };
            };

            const engagement = getEmoji(session.engagement);
            const discipline = getEmoji(session.discipline);
            const enjoyment = getEmoji(session.enjoyment);
            const achievement = getEmoji(session.achievement);

            // Generate student scores list for this session
            let studentScoresHtml = '';
            if (session.studentScoresSnapshot && session.studentScoresSnapshot.length > 0) {
                studentScoresHtml = `
                    <p><strong>Puntos de la Sesión:</strong></p>
                    <ul class="session-student-scores-list">
                        ${session.studentScoresSnapshot.map(s => `<li>${s.name}: ${s.score} puntos</li>`).join('')}
                    </ul>
                `;
            } else {
                studentScoresHtml = '<p class="notes">No se registraron puntos de alumnos para esta sesión.</p>';
            }


            sessionCard.innerHTML = `
                <h4>Sesión ${session.sessionNumber} del ${session.date}</h4>
                <div class="feedback-summary">
                    <p>Compromiso: <span class="emoji-display ${engagement.class}">${engagement.emoji}</span></p>
                    <p>Disciplina: <span class="emoji-display ${discipline.class}">${discipline.emoji}</span></p>
                    <p>Disfrute: <span class="emoji-display ${enjoyment.class}">${enjoyment.emoji}</span></p>
                    <p>Logro Objetivos: <span class="emoji-display ${achievement.class}">${achievement.emoji}</span></p>
                </div>
                ${studentScoresHtml}
                ${session.notes ? `<p class="notes"><strong>Notas:</strong> ${session.notes}</p>` : ''}
                ${session.selectedGames && session.selectedGames.length > 0 ? `
                    <p><strong>Juegos Jugados:</strong></p>
                    <ul class="games-played-list">
                        ${session.selectedGames.map(game => `<li>${game}</li>`).join('')}
                    </ul>
                ` : '<p class="notes">No se registraron juegos para esta sesión.</p>'}
                <button class="delete-session-btn" data-index="${index}">🗑</button>
            `;
            sessionHistoryDisplay.appendChild(sessionCard);
        });

        attachDeleteSessionListeners();
    }

    function attachDeleteSessionListeners() {
        document.querySelectorAll('.delete-session-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const indexToDelete = parseInt(e.target.dataset.index);
                deleteSessionFromHistory(indexToDelete); // Corrected this to use indexToDelete
            });
        });
    }

    function deleteSessionFromHistory(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta sesión del historial? Esta acción no se puede deshacer.')) {
            sessionsHistory.splice(index, 1);
            saveSessionHistoryForClass(currentClassId);
            renderSessionHistory();
            alert('Sesión eliminada del historial.');
        }
    }


    // --- Timer Logic ---
    startTimerBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            return;
        }
        const minutes = parseInt(timerMinutesInput.value) || 0;
        const seconds = parseInt(timerSecondsInput.value) || 0;

        if (minutes === 0 && seconds === 0) {
            alert('Por favor, introduce un tiempo válido.');
            return;
        }

        timeRemaining = (minutes * 60) + seconds;
        initialTimeForAnimation = timeRemaining;
        isTimerRunning = true;
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        timerBall.style.backgroundColor = '#3498db'; // Reset color
        timerBall.style.transition = 'width 1s linear, height 1s linear, background-color 0.5s ease-in-out'; // Add transition

        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            updateTimerBallAnimation();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                startTimerBtn.disabled = false;
                pauseTimerBtn.disabled = true;
                timerDisplay.textContent = '00:00';
                timerBall.style.width = '100%'; // Full size for final boom
                timerBall.style.height = '100%';
                timerBall.style.backgroundColor = '#e74c3c'; // Red for boom
                if (boomSound) {
                    boomSound.play();
                }
                alert('¡Tiempo terminado!');
            }
        }, 1000);
    });

    pauseTimerBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            startTimerBtn.disabled = false;
            pauseTimerBtn.disabled = true;
            timerBall.style.backgroundColor = '#f1c40f'; // Yellow for paused
        }
    });

    resetTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        timeRemaining = 0;
        initialTimeForAnimation = 0;
        timerMinutesInput.value = '';
        timerSecondsInput.value = '';
        timerDisplay.textContent = '00:00';
        timerBall.style.width = '150px'; // Initial size
        timerBall.style.height = '150px';
        timerBall.style.backgroundColor = '#3498db'; // Initial color
        timerBall.style.transition = 'none'; // Remove transition for instant reset
    });

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimerBallAnimation() {
        if (initialTimeForAnimation === 0) return;

        const percentageRemaining = (timeRemaining / initialTimeForAnimation);
        // Scale from 150px (initial) to 200px (max inflation)
        const newSize = 150 + (50 * (1 - percentageRemaining));
        timerBall.style.width = `${newSize}px`;
        timerBall.style.height = `${newSize}px`;

        // Change color based on remaining time percentage
        if (percentageRemaining < 0.25) {
            timerBall.style.backgroundColor = '#e74c3c'; // Red (last 25%)
        } else if (percentageRemaining < 0.5) {
            timerBall.style.backgroundColor = '#f39c12'; // Orange (last 50%)
        } else {
            timerBall.style.backgroundColor = '#3498db'; // Blue (first 50%)
        }
    }


    // --- INITIALIZATION ---
    loadFromLocalStorage();
    // Initially display the message for game results until a category is selected
    gameResultsDisplay.innerHTML = '<p class="initial-message">Selecciona una categoría para ver los juegos.</p>';

    // Set default background color for the body on load
    document.body.style.backgroundColor = '#FFFEE0'; // Very light yellow
});