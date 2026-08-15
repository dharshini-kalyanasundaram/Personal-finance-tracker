
// Store transactions

let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];


// Get HTML elements

const form = document.getElementById("transactionForm");

const descriptionInput =
    document.getElementById("description");

const amountInput =
    document.getElementById("amount");

const typeInput =
    document.getElementById("type");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const transactionList =
    document.getElementById("transactionList");

const searchInput =
    document.getElementById("search");

const filterType =
    document.getElementById("filterType");

const filterCategory =
    document.getElementById("filterCategory");


// Chart variable

let expenseChart;


// Add Transaction

form.addEventListener("submit", function(event) {

    event.preventDefault();


    const description =
        descriptionInput.value;

    const amount =
        Number(amountInput.value);

    const type =
        typeInput.value;

    const category =
        categoryInput.value;

    const date =
        dateInput.value;


    const transaction = {

        id: Date.now(),

        description: description,

        amount: amount,

        type: type,

        category: category,

        date: date

    };


    transactions.push(transaction);


    saveTransactions();


    form.reset();


    displayTransactions();

    updateDashboard();

    updateChart();

    updateInsight();

});


// Display Transactions

function displayTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        searchInput.value.toLowerCase();


    const selectedType =
        filterType.value;


    const selectedCategory =
        filterCategory.value;


    const filteredTransactions =
        transactions.filter(function(transaction) {


            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText);


            const matchesType =
                selectedType === "all" ||
                transaction.type === selectedType;


            const matchesCategory =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    filteredTransactions.forEach(function(transaction) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${transaction.description}
            </td>

            <td>
                ₹${transaction.amount}
            </td>

            <td>
                ${transaction.type}
            </td>

            <td>
                ${transaction.category}
            </td>

            <td>
                ${transaction.date}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>

            </td>

        `;


        transactionList.appendChild(row);

    });

}


// Delete Transaction

function deleteTransaction(id) {

    transactions =
        transactions.filter(function(transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    displayTransactions();

    updateDashboard();

    updateChart();

    updateInsight();

}


// Edit Transaction

function editTransaction(id) {

    const transaction =
        transactions.find(function(transaction) {

            return transaction.id === id;

        });


    if (!transaction) {

        return;

    }


    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    typeInput.value =
        transaction.type;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;


    deleteTransaction(id);

}


// Dashboard

function updateDashboard() {


    let income = 0;

    let expense = 0;


    transactions.forEach(function(transaction) {


        if (transaction.type === "income") {

            income += transaction.amount;

        }

        else {

            expense += transaction.amount;

        }

    });


    const balance =
        income - expense;


    document.getElementById(
        "totalIncome"
    ).innerText = "₹" + income;


    document.getElementById(
        "totalExpense"
    ).innerText = "₹" + expense;


    document.getElementById(
        "balance"
    ).innerText = "₹" + balance;

}


// Save Data

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// Search

searchInput.addEventListener(
    "input",
    displayTransactions
);


// Filter

filterType.addEventListener(
    "change",
    displayTransactions
);


filterCategory.addEventListener(
    "change",
    displayTransactions
);


// Expense Chart

function updateChart() {


    const categoryTotals = {};


    transactions.forEach(function(transaction) {


        if (transaction.type === "expense") {


            if (!categoryTotals[transaction.category]) {

                categoryTotals[transaction.category] = 0;

            }


            categoryTotals[transaction.category] +=
                transaction.amount;

        }

    });


    const categories =
        Object.keys(categoryTotals);


    const amounts =
        Object.values(categoryTotals);


    if (expenseChart) {

        expenseChart.destroy();

    }


    const ctx =
        document.getElementById(
            "expenseChart"
        );


    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: categories,

            datasets: [{

                data: amounts

            }]

        },

        options: {

            responsive: true

        }

    });

}


// Spending Insight

function updateInsight() {


    const expenses =
        transactions.filter(function(transaction) {

            return transaction.type === "expense";

        });


    if (expenses.length === 0) {

        document.getElementById("insight").innerText =
            "Add some expenses to see your spending insight.";

        document.getElementById("prediction").innerText =
            "Expense prediction will appear here.";

        return;

    }


    const categoryTotals = {};


    expenses.forEach(function(transaction) {


        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }


        categoryTotals[transaction.category] +=
            transaction.amount;

    });


    let highestCategory = "";

    let highestAmount = 0;


    for (let category in categoryTotals) {


        if (
            categoryTotals[category] >
            highestAmount
        ) {

            highestAmount =
                categoryTotals[category];

            highestCategory =
                category;

        }

    }


    document.getElementById("insight").innerText =

        "Your highest spending category is " +
        highestCategory +
        " with ₹" +
        highestAmount +
        ".";


    // Simple prediction

    let totalExpense = 0;


    expenses.forEach(function(transaction) {

        totalExpense += transaction.amount;

    });


    const averageExpense =
        totalExpense / expenses.length;


    const predictedExpense =
        Math.round(averageExpense * 30);


    document.getElementById("prediction").innerText =

        "Simple estimated monthly expense: ₹" +
        predictedExpense;

}


// Initial load

displayTransactions();

updateDashboard();

updateChart();

updateInsight();
