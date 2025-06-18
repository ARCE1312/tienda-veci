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

const panels = document.querySelectorAll('.panel');
const sidebarButtons = document.querySelectorAll('.sidebar button');

function showPanel(panelId) {
  panels.forEach(panel => panel.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
}

// Calcular precio sugerido
document.getElementById('product-cost').addEventListener('input', () => {
  const cost = parseFloat(document.getElementById('product-cost').value);
  const preview = document.getElementById('price-preview');
  if (!isNaN(cost)) {
    const suggested = cost * 1.35;
    preview.textContent = `$${suggested.toFixed(2)}`;
  } else {
    preview.textContent = '$0.00';
  }
});

// Guardar producto
document.getElementById('product-cost').addEventListener('input', () => {
  const cost = parseFloat(document.getElementById('product-cost').value);
  const priceField = document.getElementById('product-price');
  if (!isNaN(cost)) {
    const suggested = cost * 1.35;
    priceField.value = suggested.toFixed(2);
  } else {
    priceField.value = '';
  }
});

  }

  const price = cost * 1.35;

  const newProduct = {
    id: Date.now().toString(),
    name,
    cost,
    price,
    quantity
  };

  DB.products.push(newProduct);
  DB.saveProducts();
  alert('Producto guardado exitosamente.');
  e.target.reset();
  document.getElementById('price-preview').textContent = '$0.00';
});

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
          <th>Precio Compra</th>
          <th>Precio Venta</th>
          <th>Cantidad</th>
        </tr>
      </thead>
      <tbody>`;

  DB.products.forEach(p => {
    html += `
      <tr>
        <td>${p.name}</td>
        <td>$${p.cost.toFixed(2)}</td>
        <td>$${p.price.toFixed(2)}</td>
        <td>${p.quantity}</td>
      </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function loadProductsForSale() {
  const select = document.getElementById('sale-product');
  select.innerHTML = '<option value="" disabled selected>Seleccione un producto</option>';
  DB.products.forEach(p => {
    if (p.quantity > 0) {
      select.innerHTML += `<option value="${p.id}">${p.name} (Disponible: ${p.quantity})</option>`;
    }
  });
}

document.getElementById('form-sale').addEventListener('submit', (e) => {
  e.preventDefault();
  const productId = document.getElementById('sale-product').value;
  const quantity = parseInt(document.getElementById('sale-quantity').value);
  const product = DB.products.find(p => p.id === productId);

  if (!product || quantity > product.quantity || quantity <= 0) {
    alert('Cantidad inválida o sin stock suficiente.');
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
  alert('Venta registrada.');
  e.target.reset();
  loadProductsForSale();
});

function loadBalance() {
  const today = new Date().toLocaleDateString();
  const todaySales = DB.sales.filter(s => s.date === today);
  const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = todaySales.reduce((sum, s) => {
    const prod = DB.products.find(p => p.id === s.productId);
    return sum + ((prod?.cost || 0) * s.quantity);
  }, 0);
  const profit = totalSales - totalExpenses;

  document.getElementById('balance-container').innerHTML = `
    <div class="balance-card">
      <h3>Hoy: ${today}</h3>
      <p>Ventas: <span class="highlight">$${totalSales.toFixed(2)}</span></p>
      <p>Gastos: <span class="highlight-danger">$${totalExpenses.toFixed(2)}</span></p>
      <p>Ganancias: <span class="highlight-${profit >= 0 ? 'success' : 'danger'}">$${profit.toFixed(2)}</span></p>
    </div>`;
}

sidebarButtons.forEach(button => {
  button.addEventListener('click', () => {
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    showPanel(button.dataset.panel);
    if (button.dataset.panel === 'view-products') loadProducts();
    if (button.dataset.panel === 'add-sale') loadProductsForSale();
    if (button.dataset.panel === 'view-balance') loadBalance();
  });
});

showPanel('add-product');
