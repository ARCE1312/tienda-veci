// Base de datos local usando LocalStorage
const DB = {
  products: JSON.parse(localStorage.getItem('products')) || [],
  sales: JSON.parse(localStorage.getItem('sales')) || [],

  saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  },

  saveSales() {
    localStorage.setItem('sales', JSON.stringify(this.sales));
  }
};

// Manejador de paneles
const panels = document.querySelectorAll('.panel');
const sidebarButtons = document.querySelectorAll('.sidebar button');

function showPanel(panelId) {
  panels.forEach(panel => {
    panel.classList.remove('active');
    if (panel.id === panelId) {
      panel.classList.add('active');
    }
  });
}

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const targetPanel = button.dataset.panel;
    showPanel(targetPanel);

    if (targetPanel === 'view-products') loadProducts();
    if (targetPanel === 'add-sale') loadProductsForSale();
    if (targetPanel === 'view-balance') loadBalance();
  });
});

// Mostrar precio sugerido automáticamente al escribir el precio de compra
document.getElementById('product-cost').addEventListener('input', () => {
  const cost = parseFloat(document.getElementById('product-cost').value);
  const priceInput = document.getElementById('product-price');

  if (!isNaN(cost)) {
    const suggestedPrice = cost * 1.35;
    priceInput.value = suggestedPrice.toFixed(2);
  } else {
    priceInput.value = '';
  }
});

// Guardar nuevo producto
document.getElementById('form-product').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('product-name').value.trim();
  const cost = parseFloat(document.getElementById('product-cost').value);
  const price = parseFloat(document.getElementById('product-price').value);
  const quantity = parseInt(document.getElementById('product-quantity').value);

  if (!name || isNaN(cost) || isNaN(price) || isNaN(quantity)) {
    alert('Todos los campos son obligatorios.');
    return;
  }

  DB.products.push({
    id: Date.now().toString(),
    name,
    cost,
    price,
    quantity
  });

  DB.saveProducts();
  alert('Producto registrado con éxito.');
  e.target.reset();
  document.getElementById('product-price').value = '';
});

// Cargar productos en tabla
function loadProducts() {
  const container = document.getElementById('products-container');
  if (DB.products.length === 0) {
    container.innerHTML = '<p>No hay productos registrados.</p>';
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio compra</th>
          <th>Precio venta</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>`;

  DB.products.forEach(product => {
    html += `
      <tr>
        <td>${product.name}</td>
        <td>$${product.cost.toFixed(2)}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.quantity}</td>
      </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Cargar productos para vender
function loadProductsForSale() {
  const select = document.getElementById('sale-product');
  select.innerHTML = '<option value="" disabled selected>Seleccione un producto</option>';

  DB.products.forEach(product => {
    if (product.quantity > 0) {
      select.innerHTML += `
        <option value="${product.id}">${product.name} (Disponible: ${product.quantity})</option>`;
    }
  });
}

// Registrar una venta
document.getElementById('form-sale').addEventListener('submit', (e) => {
  e.preventDefault();

  const productId = document.getElementById('sale-product').value;
  const quantity = parseInt(document.getElementById('sale-quantity').value);
  const product = DB.products.find(p => p.id === productId);

  if (!product || isNaN(quantity) || quantity <= 0 || quantity > product.quantity) {
    alert('Cantidad inválida o producto sin stock suficiente.');
    return;
  }

  product.quantity -= quantity;

  DB.sales.push({
    productId,
    name: product.name,
    price: product.price,
    quantity,
    total: product.price * quantity,
    date: new Date().toLocaleDateString()
  });

  DB.saveProducts();
  DB.saveSales();
  alert('Venta registrada correctamente.');
  e.target.reset();
  loadProductsForSale();
});

// Mostrar balance del día
function loadBalance() {
  const today = new Date().toLocaleDateString();
  const todaySales = DB.sales.filter(sale => sale.date === today);
  const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = todaySales.reduce((sum, s) => {
    const prod = DB.products.find(p => p.id === s.productId);
    return sum + ((prod?.cost || 0) * s.quantity);
  }, 0);
  const profit = totalSales - totalExpenses;

  document.getElementById('balance-container').innerHTML = `
    <div class="balance-card">
      <h3>${today}</h3>
      <p>Ventas: <span class="highlight">$${totalSales.toFixed(2)}</span></p>
      <p>Gastos: <span class="highlight-danger">$${totalExpenses.toFixed(2)}</span></p>
      <p>Ganancias: <span class="highlight-${profit >= 0 ? 'success' : 'danger'}">$${profit.toFixed(2)}</span></p>
    </div>`;
}

// Panel por defecto
showPanel('add-product');
