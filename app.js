// Base de datos en LocalStorage
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

// Elementos del DOM
const panels = document.querySelectorAll('.panel');
const sidebarButtons = document.querySelectorAll('.sidebar button');

// Mostrar el panel activo
function showPanel(panelId) {
  panels.forEach(panel => {
    panel.classList.remove('active');
  });
  const targetPanel = document.getElementById(panelId);
  if (targetPanel) targetPanel.classList.add('active');
}

// Mostrar productos en tabla
function loadProducts() {
  const container = document.getElementById('products-container');
  if (!container) return;

  if (DB.products.length === 0) {
    container.innerHTML = '<p>No hay productos registrados.</p>';
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>
  `;

  DB.products.forEach(product => {
    html += `
      <tr>
        <td>${product.name}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.quantity}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// Llenar select con productos disponibles para la venta
function loadProductsForSale() {
  const select = document.getElementById('sale-product');
  if (!select) return;

  select.innerHTML = '<option value="" disabled selected>Seleccione un producto</option>';

  DB.products.forEach(product => {
    if (product.quantity > 0) {
      select.innerHTML += `
        <option value="${product.id}">
          ${product.name} (Disponible: ${product.quantity})
        </option>
      `;
    }
  });
}

// Mostrar balance de ventas del día
function loadBalance() {
  const container = document.getElementById('balance-container');
  if (!container) return;

  const today = new Date().toLocaleDateString();
  const todaySales = DB.sales.filter(sale => sale.date === today);
  const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = DB.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const profit = totalSales - totalExpenses;

  container.innerHTML = `
    <div class="balance-card">
      <h3>Hoy: ${today}</h3>
      <p>Ventas: <span class="highlight">$${totalSales.toFixed(2)}</span></p>
      <p>Gastos: <span class="highlight-danger">$${totalExpenses.toFixed(2)}</span></p>
      <p>Ganancias: <span class="highlight-${profit >= 0 ? 'success' : 'danger'}">$${profit.toFixed(2)}</span></p>
    </div>
  `;
}

// Escuchar clics en los botones laterales
sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const panel = button.dataset.panel;
    showPanel(panel);

    // Actualiza el contenido dinámico según el panel
    if (panel === 'view-products') loadProducts();
    if (panel === 'add-sale') loadProductsForSale();
    if (panel === 'view-balance') loadBalance();
  });
});

// Formulario para agregar producto
const formProduct = document.getElementById('form-product');
if (formProduct) {
  formProduct.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);

    if (!name || isNaN(price) || isNaN(quantity)) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name,
      price,
      quantity
    };

    DB.products.push(newProduct);
    DB.saveProducts();
    alert('Producto registrado con éxito!');
    e.target.reset();
  });
}

// Formulario para registrar venta
const formSale = document.getElementById('form-sale');
if (formSale) {
  formSale.addEventListener('submit', (e) => {
    e.preventDefault();

    const productId = document.getElementById('sale-product').value;
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    const product = DB.products.find(p => p.id === productId);

    if (!product) {
      alert('Producto no encontrado.');
      return;
    }

    if (quantity > product.quantity || quantity <= 0) {
      alert('Cantidad inválida o stock insuficiente.');
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
    alert('Venta registrada!');
    e.target.reset();
    loadProductsForSale();
  });
}

// Inicialización
showPanel('add-product');
