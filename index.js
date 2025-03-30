// Initialize state
let transactions = [];

// Fetch Transactions from the API
const fetchTransactions = () => {
  fetch('https://your-api-endpoint.com/transactions') // Replace with your API endpoint
    .then(response => response.json())
    .then(data => {
      transactions = data; // Assign fetched data to the transactions array
      updateSummary(); // Update the financial summary
      renderTransactions(); // Render all fetched transactions
    })
    .catch(error => console.error('Error fetching transactions:', error));
};

// Utility Functions
const updateSummary = () => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  document.getElementById('income').textContent = `KSh ${income.toFixed(2)}`;
  document.getElementById('expenses').textContent = `KSh ${expenses.toFixed(2)}`;
  document.getElementById('balance').textContent = `Balance: KSh ${balance.toFixed(2)}`;
};

const renderTransactions = (filteredTransactions = transactions) => {
  const transactionsList = document.getElementById('transactions-list');
  transactionsList.innerHTML = filteredTransactions
    .map(t => `
      <li class="${t.type}">
        ${t.description} - KSh ${t.amount.toFixed(2)}
        <button onclick="deleteTransaction(${t.id})">Delete</button>
      </li>
    `)
    .join('');
};

// Delete Transaction from State and Server
const deleteTransaction = (id) => {
  // Remove locally
  transactions = transactions.filter(t => t.id !== id);
  updateSummary();
  renderTransactions();

  // Delete from the server
  fetch(`https://your-api-endpoint.com/transactions/${id}`, { method: 'DELETE' })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete transaction');
      console.log(`Transaction with ID ${id} deleted successfully`);
    })
    .catch(error => console.error('Error deleting transaction:', error));
};

// Add Transaction to State and Server
const addTransaction = (event) => {
  event.preventDefault();

  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if (!description || isNaN(amount) || amount <= 0) {
    alert('Please enter valid details');
    return;
  }

  const newTransaction = {
    id: Date.now(), // Temporary ID
    description,
    amount,
    type,
  };

  // Add to local state immediately
  transactions.push(newTransaction);
  updateSummary();
  renderTransactions();

  // Save to the server
  fetch('https://your-api-endpoint.com/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTransaction),
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to save transaction');
      return response.json();
    })
    .then(savedTransaction => {
      console.log('Transaction saved:', savedTransaction);
    })
    .catch(error => console.error('Error adding transaction:', error));
};

// Search Transactions
const searchTransactions = () => {
  const query = document.getElementById('search').value.toLowerCase();

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(query)
  );

  renderTransactions(filteredTransactions);
};

// Toggle Dark Mode
const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
};

// Event Listeners
document.getElementById('transaction-form').addEventListener('submit', addTransaction);
document.getElementById('search').addEventListener('input', searchTransactions);
document.getElementById('toggle-mode').addEventListener('click', toggleDarkMode);

// Fetch transactions on page load
document.addEventListener('DOMContentLoaded', fetchTransactions);
