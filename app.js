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

// Paneles
const panels = document.querySelectorAll('.panel');
const sidebarButtons = document.querySelectorAll('.sidebar button');

function showPanel(panelId) {
  panels.forEach(panel => panel.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
}

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const panel = button.dataset.panel;
    showPanel(panel);
    if (panel === 'view-products') loadProducts();
    if (panel === 'add-sale') loadProductsForSale();
    if (panel === 'view-balance') loadBalance();
  });
});

// Precio sugerido
let suggestedPrice = 0;

document.getElementById('product-cost').addEventListener('input', () => {
  const cost = parseFloat(document.getElementById('product-cost').value);
  suggestedPrice = !isNaN(cost) ? (cost * 1.35).toFixed(2) : 0;
});

document.getElementById('btn-suggested').addEventListener('click', () => {
  if (suggestedPrice > 0) {
    document.getElementById('product-price').value = suggestedPrice;
  } else {
    alert('Ingresa primero el precio de compra');
  }
});

// Registrar producto
document.getElementById('form-product').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('product-name').value.trim();
  const cost = parseFloat(document.getElementById('product-cost').value);
  const price = parseFloat(document.getElementById('product-price').value);
  const quantity = parseInt(document.getElementById('product-quantity').value);

  if (!name || isNaN(cost) || isNaN(price) || isNaN(quantity)) {
    alert('Todos los campos deben estar completos');
    return;
  }

  DB.products.push({ id: Date.now().toString(), name, cost, price, quantity });
  DB.saveProducts();
  alert('Producto guardado con éxito');
  e.target.reset();
  suggestedPrice = 0;
});

// Cargar inventario
function loadProducts() {
  const container = document.getElementById('products-container');
  if (DB.products.length === 0) {
    container.innerHTML = '<p>No hay productos registrados.</p>';
    return;
  }

  let html = `<table><thead><tr><th>Nombre</th><th>Compra</th><th>Venta</th><th>Cantidad</th></tr></thead><tbody>`;
  DB.products.forEach(p => {
    html += `<tr><td>${p.name}</td><td>$${p.cost.toFixed(2)}</td><td>$${p.price.toFixed(2)}</td><td>${p.quantity}</td></tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Registrar venta
document.getElementById('form-sale').addEventListener('submit', (e) => {
  e.preventDefault();
  const productId = document.getElementById('sale-product').value;
  const quantity = parseInt(document.getElementById('sale-quantity').value);
  const product = DB.products.find(p => p.id === productId);

  if (!product || quantity > product.quantity) {
    alert('Stock insuficiente');
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
  alert('Venta registrada');
  e.target.reset();
  loadProductsForSale();
});

// Cargar productos para venta
function loadProductsForSale() {
  const select = document.getElementById('sale-product');
  select.innerHTML = '<option value="" disabled selected>Seleccione un producto</option>';
  DB.products.forEach(product => {
    if (product.quantity > 0) {
      select.innerHTML += `<option value="${product.id}">${product.name} (Stock: ${product.quantity})</option>`;
    }
  });
}

// Mostrar balance
function loadBalance() {
  const today = new Date().toLocaleDateString();
  const todaySales = DB.sales.filter(s => s.date === today);
  const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalCosts = todaySales.reduce((sum, s) => {
    const prod = DB.products.find(p => p.id === s.productId);
    return sum + (prod?.cost || 0) * s.quantity;
  }, 0);
  const profit = totalSales - totalCosts;

  document.getElementById('balance-container').innerHTML = `
    <div class="balance-card">
      <p>Ventas: <strong>$${totalSales.toFixed(2)}</strong></p>
      <p>Gastos: <strong>$${totalCosts.toFixed(2)}</strong></p>
      <p>Ganancias: <strong style="color:${profit >= 0 ? 'limegreen' : 'red'}">$${profit.toFixed(2)}</strong></p>
    </div>`;
}

// Inicial
showPanel('add-product');
