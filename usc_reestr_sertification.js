// Знаходимо елемент для виведення результату
const res = document.querySelector('.result');

// Отримуємо всі accordion-header з акордеону
const accordionHeaders = document.querySelectorAll('#accordionCustom .accordion-header');

// Ініціалізуємо масив для результатів (масив масивів)
const resultTable = [];

// Додаємо заголовки таблиці як перший рядок, включаючи колонку "№"
resultTable.push([
    '№',
    'Суб’єкт підвищення кваліфікації',
    'Документ про підвищення кваліфікації',
    'Серія, номер, дата видачі документа про ПК',
    'Напрям підвищення кваліфікації',
    'Обcяг підвищення кваліфікації'
]);

// Лічильник для початкового номера (тимчасовий)
let tempRowNumber = 1;

// Масив для зберігання даних із роками та датами
const rowsWithDates = [];

// Проходимо по кожному accordion-header
accordionHeaders.forEach(header => {
    // Знаходимо відповідний контент для кожного заголовка (наступний елемент після заголовка)
    const accordionBody = header.nextElementSibling;

    // Колонка 1: Суб’єкт підвищення кваліфікації
    const orgRow = Array.from(accordionBody.querySelectorAll('.certificate__details-row span'))
        .find(span => span.textContent.includes('Організація що видала:'));
    const orgName = orgRow ? orgRow.nextElementSibling?.textContent.trim() : '-';

    // Колонка 2: Документ про підвищення кваліфікацію
    const docTitle = accordionBody.querySelector('.certificate__details-title')?.textContent.trim() || '-';

    // Колонка 3: Серія, номер, дата видачі документа про ПК
    const serialRow = Array.from(accordionBody.querySelectorAll('.certificate__details-row span'))
        .find(span => span.textContent.includes('Серія/номер:'));
    const serialNumber = serialRow ? serialRow.nextElementSibling?.textContent.trim() : '-';

    const dateRow = Array.from(accordionBody.querySelectorAll('.certificate__details-row span'))
        .find(span => span.textContent.includes('Дата видачі (отримання):'));
    const issueDate = dateRow ? dateRow.nextElementSibling?.textContent.trim() : '-';

    const serialAndDate = serialNumber !== '-' && issueDate !== '-' 
        ? `${serialNumber}, ${issueDate}`
        : serialNumber !== '-' 
        ? serialNumber 
        : issueDate !== '-' 
        ? issueDate 
        : '-';

    // Витягуємо рік і повну дату для сортування
    let year = '-';
    let sortableDate = null; // Для сортування у форматі Date
    if (issueDate !== '-') {
        const dateParts = issueDate.split('.');
        if (dateParts.length === 3) {
            const [day, month, yr] = dateParts;
            year = yr; // Рік
            // Перетворюємо дату у формат РРРР-ММ-ДД для коректного сортування
            sortableDate = new Date(`${yr}-${month}-${day}`);
        }
    }

    // Колонка 4: Напрям підвищення кваліфікації (шукаємо в accordion-header)
    const sertThemeElement = header.querySelector('span.sertThem');
    const sertTheme = sertThemeElement ? sertThemeElement.textContent.trim() : '-';

    // Колонка 5: Обcяг підвищення кваліфікації
    const hoursRow = Array.from(accordionBody.querySelectorAll('.certificate__details-row span'))
        .find(span => span.textContent.includes('Загальна кількість годин:'));
    const hours = hoursRow ? hoursRow.nextElementSibling?.textContent.trim() : '-';

    // Додаємо рядок із роком і датою до масиву
    rowsWithDates.push({
        row: [tempRowNumber, orgName, docTitle, serialAndDate, sertTheme, hours],
        year: year,
        sortableDate: sortableDate // Для сортування за датою
    });

    // Збільшуємо тимчасовий лічильник
    tempRowNumber++;
});

// Сортуємо рядки спочатку за роками, потім за датами
rowsWithDates.sort((a, b) => {
    // Спочатку сортуємо за роками
    if (a.year === '-') return 1; // Рядки без року в кінець
    if (b.year === '-') return -1;
    if (a.year !== b.year) {
        return parseInt(a.year) - parseInt(b.year);
    }

    // Якщо роки однакові, сортуємо за датами
    if (!a.sortableDate) return 1; // Рядки без дати в кінець року
    if (!b.sortableDate) return -1;
    return a.sortableDate - b.sortableDate; // Сортування від початку року до кінця
});

// Формуємо остаточний масив із розділовими рядками
let finalTable = [resultTable[0]]; // Додаємо заголовки
let currentYear = null;

// Лічильник для перенумерації
let newRowNumber = 1;

rowsWithDates.forEach(item => {
    const year = item.year;
    let row = item.row;

    // Якщо рік змінився і це не перший рядок із роком, додаємо розділовий рядок
    if (currentYear !== year && year !== '-') {
        if (currentYear !== null) {
            // Додаємо порожній рядок перед новим роком (якщо це не перший рік)
            finalTable.push(['', '', '', '', '', '']);
        }
        finalTable.push([`${year}`, '', '', '', '', '']);
        currentYear = year;
    }

    // Перенумеровуємо рядок (перший елемент у рядку)
    row[0] = newRowNumber;

    // Додаємо рядок із даними
    finalTable.push(row);

    // Збільшуємо лічильник для наступного рядка
    newRowNumber++;
});

// Створюємо HTML таблицю для відображення результатів
let tableHTML = '<table border="1"><thead><tr>';
finalTable[0].forEach(header => {
    tableHTML += `<th>${header}</th>`;
});
tableHTML += '</tr></thead><tbody>';

// Додаємо рядки з даними
for (let i = 1; i < finalTable.length; i++) {
    const row = finalTable[i];
    const firstCell = String(row[0]); // Конвертуємо в рядок для безпечної перевірки

    // Якщо це розділовий рядок (тобто рік), додаємо стиль
    if (firstCell !== '' && !isNaN(firstCell) && rowsWithDates.some(item => item.year === firstCell)) {
        tableHTML += '<tr style="background-color: #f0f0f0; font-weight: bold;">';
        tableHTML += `<td colspan="6">${row[0]}</td>`;
    } else if (firstCell === '') {
        // Порожній рядок для розділення
        tableHTML += '<tr style="height: 10px;"><td colspan="6"></td></tr>';
    } else {
        tableHTML += '<tr>';
        row.forEach(cell => {
            tableHTML += `<td>${cell}</td>`;
        });
    }
    tableHTML += '</tr>';
}

tableHTML += '</tbody></table>';

// Вставляємо таблицю в елемент .result
res.innerHTML = tableHTML;
