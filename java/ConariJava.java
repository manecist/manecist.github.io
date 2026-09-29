import java.awt.*;
import java.awt.datatransfer.StringSelection;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;

/** Recurso demostrativo nuevo, Java 11+. Sin dependencias ni conexión a Internet. */
public class ConariJava {
    private static final Color BACKGROUND = new Color(255, 245, 249);
    private static final Color PAPER = new Color(255, 253, 250);
    private static final Color PINK = new Color(248, 213, 226);
    private static final Color ROSE = new Color(153, 52, 94);
    private static final Color INK = new Color(63, 39, 64);
    private static final Color LILAC = new Color(231, 222, 248);
    private static final Font BODY = new Font("SansSerif", Font.PLAIN, 15);
    private static final MathContext PRECISION = new MathContext(16, RoundingMode.HALF_UP);
    private static final NumberFormat CLP = NumberFormat.getIntegerInstance(new Locale("es", "CL"));

    public static void main(String[] args) {
        if (args.length > 0 && "--test".equals(args[0])) {
            runTests();
            return;
        }
        if (GraphicsEnvironment.isHeadless()) {
            System.err.println("Se necesita un escritorio para abrir la aplicación. Usa --test para comprobar la lógica.");
            System.exit(1);
        }
        SwingUtilities.invokeLater(ConariJava::open);
    }

    private static void open() {
        UIManager.put("Panel.background", BACKGROUND);
        UIManager.put("Label.foreground", INK);
        UIManager.put("Label.font", BODY);
        UIManager.put("Button.font", BODY.deriveFont(Font.BOLD));
        UIManager.put("TabbedPane.font", BODY.deriveFont(Font.BOLD));
        UIManager.put("TabbedPane.selected", PINK);
        UIManager.put("ToolTip.font", BODY);
        JFrame frame = new JFrame("Java mágico · María Inés | Studios Conari");
        frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        frame.setMinimumSize(new Dimension(860, 760));
        JPanel shell = new JPanel(new BorderLayout(0, 14));
        shell.setBorder(new EmptyBorder(24, 24, 16, 24));
        JPanel heading = new JPanel(new BorderLayout(20, 8));
        JLabel title = new JLabel("Java también puede tener magia");
        title.setFont(BODY.deriveFont(Font.BOLD, 27f));
        heading.add(title, BorderLayout.NORTH);
        heading.add(new JLabel("María Inés · Studios Conari · Demostración de escritorio"), BorderLayout.CENTER);
        shell.add(heading, BorderLayout.NORTH);
        JTabbedPane tabs = new JTabbedPane();
        tabs.setForeground(INK);
        tabs.addTab("Calculadora encantada", new CalculatorPanel());
        tabs.addTab("Caja de pequeñas maravillas", new RegisterPanel());
        tabs.setMnemonicAt(0, KeyEvent.VK_C);
        tabs.setMnemonicAt(1, KeyEvent.VK_M);
        tabs.getAccessibleContext().setAccessibleName("Aplicaciones Java de demostración");
        shell.add(tabs, BorderLayout.CENTER);
        JLabel signature = new JLabel("STUDIOS CONARI  ·  Donde nacen mundos y leyendas eternas", SwingConstants.CENTER);
        signature.setFont(BODY.deriveFont(12f));
        shell.add(signature, BorderLayout.SOUTH);
        frame.setContentPane(shell);
        frame.setSize(1040, 810);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private static JPanel card(LayoutManager layout) {
        JPanel panel = new JPanel(layout);
        panel.setBackground(PAPER);
        panel.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(PINK, 2, true), new EmptyBorder(18, 18, 18, 18)));
        return panel;
    }

    private static JButton button(String label, String description, Runnable action) {
        JButton button = new JButton(label);
        button.setBackground(PINK);
        button.setForeground(INK);
        button.setFocusPainted(true);
        button.setOpaque(true);
        button.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(210, 160, 184), 1, true),
            new EmptyBorder(12, 14, 12, 14)));
        button.setToolTipText(description);
        button.getAccessibleContext().setAccessibleName(description);
        button.addActionListener(event -> action.run());
        return button;
    }

    static String money(long amount) { return "$" + CLP.format(amount) + " CLP"; }

    static BigDecimal calculate(BigDecimal left, String operation, BigDecimal right) {
        BigDecimal result;
        switch (operation) {
            case "+": result = left.add(right, PRECISION); break;
            case "−": result = left.subtract(right, PRECISION); break;
            case "×": result = left.multiply(right, PRECISION); break;
            case "÷":
                if (right.signum() == 0) throw new IllegalArgumentException("No se puede dividir por cero.");
                result = left.divide(right, PRECISION); break;
            default: throw new IllegalArgumentException("Operación no reconocida.");
        }
        return bounded(result);
    }

    static BigDecimal bounded(BigDecimal value) {
        if (value.abs().compareTo(new BigDecimal("1E100")) > 0)
            throw new IllegalArgumentException("El resultado es demasiado grande.");
        if (value.signum() != 0 && value.abs().compareTo(new BigDecimal("1E-100")) < 0)
            throw new IllegalArgumentException("El resultado es demasiado pequeño.");
        return value;
    }

    static BigDecimal unary(BigDecimal value, String operation) {
        switch (operation) {
            case "%": return bounded(value.divide(new BigDecimal("100"), PRECISION));
            case "+/−": return value.negate();
            case "log₁₀":
            case "ln":
                if (value.signum() <= 0) throw new IllegalArgumentException("El logaritmo necesita un número mayor que cero.");
                double number = value.doubleValue();
                double result = "ln".equals(operation) ? Math.log(number) : Math.log10(number);
                if (!Double.isFinite(result)) throw new IllegalArgumentException("El resultado está fuera de rango.");
                return bounded(BigDecimal.valueOf(result).round(PRECISION));
            default: throw new IllegalArgumentException("Operación no reconocida.");
        }
    }

    static String number(BigDecimal value) {
        String text = value.stripTrailingZeros().toPlainString();
        return text.length() > 22 ? value.round(new MathContext(12)).stripTrailingZeros().toEngineeringString() : text;
    }

    /** Estado independiente de Swing para poder verificar las operaciones sin abrir ventanas. */
    static final class Calculator {
        String entry = "0";
        BigDecimal accumulator;
        String pending;
        boolean fresh = true;
        String message = "Tu próxima idea empieza con un número.";

        void clear() {
            entry = "0"; accumulator = null; pending = null; fresh = true;
            message = "Todo listo para comenzar.";
        }

        BigDecimal value() { return new BigDecimal(entry); }

        void digit(String digit) {
            if (fresh) { entry = "0"; fresh = false; }
            if (".".equals(digit)) {
                if (!entry.contains(".")) entry += ".";
            } else {
                if (entry.replace("-", "").replace(".", "").length() >= 16) {
                    message = "Puedes escribir hasta 16 dígitos.";
                    return;
                }
                entry = "0".equals(entry) ? digit : entry + digit;
            }
            message = pending == null ? "Número listo." : "Operación pendiente: " + pending;
        }

        void press(String key) {
            try {
                if (key.matches("[0-9.]")) { digit(key); return; }
                switch (key) {
                    case "C": clear(); return;
                    case "⌫":
                        if (!fresh) {
                            entry = entry.length() > 1 ? entry.substring(0, entry.length() - 1) : "0";
                            if ("-".equals(entry)) entry = "0";
                        }
                        return;
                    case "%": case "+/−": case "log₁₀": case "ln":
                        entry = unary(value(), key).stripTrailingZeros().toString();
                        fresh = true;
                        message = "%".equals(key) ? "Porcentaje: número dividido por 100." : "Resultado de " + key + ".";
                        return;
                    case "=":
                        if (pending != null && accumulator != null) {
                            entry = calculate(accumulator, pending, value()).stripTrailingZeros().toString();
                            message = "Resultado de la operación.";
                            pending = null; accumulator = null;
                        }
                        fresh = true;
                        return;
                    case "+": case "−": case "×": case "÷":
                        if (pending != null && !fresh)
                            entry = calculate(accumulator, pending, value()).stripTrailingZeros().toString();
                        accumulator = value(); pending = key; fresh = true;
                        message = "Operación pendiente: " + key;
                        return;
                    default: throw new IllegalArgumentException("Tecla no reconocida.");
                }
            } catch (ArithmeticException | IllegalArgumentException exception) {
                clear();
                message = exception.getMessage() + " Ingresa un número nuevo.";
            }
        }
    }

    private static final class CalculatorPanel extends JPanel {
        final Calculator calculator = new Calculator();
        final JTextField display = new JTextField("0");
        final JLabel status = new JLabel(calculator.message);

        CalculatorPanel() {
            super(new BorderLayout(18, 18));
            setBorder(new EmptyBorder(22, 22, 22, 22));
            JPanel machine = card(new BorderLayout(12, 16));
            JLabel title = new JLabel("Un poquito de lógica, un poquito de magia");
            title.setFont(BODY.deriveFont(Font.BOLD, 18f));
            JPanel output = new JPanel(new BorderLayout(0, 12));
            output.setOpaque(false);
            output.add(title, BorderLayout.NORTH);
            display.setEditable(false);
            display.setHorizontalAlignment(JTextField.RIGHT);
            display.setFont(new Font("Monospaced", Font.BOLD, 33));
            display.setBackground(new Color(242, 237, 251));
            display.setForeground(INK);
            display.setBorder(new EmptyBorder(18, 15, 18, 15));
            display.getAccessibleContext().setAccessibleName("Resultado de la calculadora");
            output.add(display, BorderLayout.CENTER);
            machine.add(output, BorderLayout.NORTH);
            JPanel keys = new JPanel(new GridLayout(6, 4, 10, 10));
            keys.setOpaque(false);
            String[] labels = {"C", "⌫", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "+/−", "0", ".", "=", "log₁₀", "ln"};
            for (String key : labels) {
                JButton control = button(key, accessibleKey(key), () -> press(key));
                control.setFont(BODY.deriveFont(Font.BOLD, 20f));
                if ("=".equals(key)) { control.setBackground(ROSE); control.setForeground(Color.WHITE); }
                if (key.startsWith("log") || "ln".equals(key)) control.setBackground(LILAC);
                keys.add(control);
            }
            keys.add(new JLabel("Java puro", SwingConstants.CENTER));
            keys.add(new JLabel("♡", SwingConstants.CENTER));
            machine.add(keys, BorderLayout.CENTER);
            status.setFont(BODY.deriveFont(13f));
            status.getAccessibleContext().setAccessibleName("Estado de la calculadora");
            machine.add(status, BorderLayout.SOUTH);
            add(machine, BorderLayout.CENTER);
            JLabel help = new JLabel("<html>Teclado: 0–9, + − * / · Enter: resultado · Esc: limpiar · %: dividir por 100<br>Operaciones en orden de entrada · log₁₀ y ln para números mayores que cero</html>");
            help.setFont(BODY.deriveFont(12f));
            add(help, BorderLayout.SOUTH);
            for (char digit = '0'; digit <= '9'; digit++) bind(KeyStroke.getKeyStroke(digit), String.valueOf(digit));
            String[][] bindings = {{"+", "+"}, {"-", "−"}, {"*", "×"}, {"/", "÷"}, {"%", "%"}, {".", "."}, {",", "."}, {"=", "="}};
            for (String[] binding : bindings) bind(KeyStroke.getKeyStroke(binding[0].charAt(0)), binding[1]);
            bind(KeyStroke.getKeyStroke(KeyEvent.VK_ENTER, 0), "=");
            bind(KeyStroke.getKeyStroke(KeyEvent.VK_ESCAPE, 0), "C");
            bind(KeyStroke.getKeyStroke(KeyEvent.VK_BACK_SPACE, 0), "⌫");
            bind(KeyStroke.getKeyStroke(KeyEvent.VK_F9, 0), "+/−");
            // The read-only display must not consume calculator keyboard actions.
            display.setFocusable(false);
        }

        private static String accessibleKey(String key) {
            switch (key) {
                case "C": return "Limpiar todo";
                case "⌫": return "Borrar último dígito";
                case "%": return "Porcentaje: dividir por cien";
                case "÷": return "Dividir";
                case "×": return "Multiplicar";
                case "−": return "Restar";
                case "+": return "Sumar";
                case "=": return "Calcular resultado";
                case "+/−": return "Cambiar signo";
                case "log₁₀": return "Logaritmo base diez";
                case "ln": return "Logaritmo natural";
                case ".": return "Separador decimal";
                default: return "Número " + key;
            }
        }

        private void bind(KeyStroke stroke, String key) {
            String action = "tecla-" + stroke;
            getInputMap(WHEN_ANCESTOR_OF_FOCUSED_COMPONENT).put(stroke, action);
            getActionMap().put(action, new AbstractAction() {
                public void actionPerformed(ActionEvent event) { press(key); }
            });
        }

        private void press(String key) {
            calculator.press(key);
            String shown = calculator.entry;
            if (calculator.fresh) shown = number(calculator.value());
            display.setText(shown.replace('.', ','));
            display.setCaretPosition(display.getText().length());
            status.setText(calculator.message);
        }
    }

    static final class Product {
        final String name;
        final long price;
        final String category;
        Product(String name, long price, String category) {
            if (price <= 0) throw new IllegalArgumentException("El precio debe ser mayor que cero.");
            this.name = name; this.price = price; this.category = category;
        }
        @Override public String toString() { return name + " · " + money(price); }
    }

    static final class Cart {
        final Map<Product, Integer> items = new LinkedHashMap<>();
        int discount = 0;
        void add(Product product, int quantity) {
            int previous = items.getOrDefault(product, 0);
            if (quantity < 1 || quantity > 99 || previous + quantity > 99)
                throw new IllegalArgumentException("Cada producto admite entre 1 y 99 unidades en el carrito.");
            items.put(product, previous + quantity);
        }
        void remove(Product product) { items.remove(product); }
        long subtotal() {
            long total = 0;
            for (Map.Entry<Product, Integer> item : items.entrySet())
                total = Math.addExact(total, Math.multiplyExact(item.getKey().price, item.getValue().longValue()));
            return total;
        }
        void discount(int percentage) {
            if (percentage < 0 || percentage > 100) throw new IllegalArgumentException("El descuento debe estar entre 0 y 100 %.");
            discount = percentage;
        }
        long reduction() {
            return BigDecimal.valueOf(subtotal()).multiply(BigDecimal.valueOf(discount))
                .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP).longValueExact();
        }
        long total() { return subtotal() - reduction(); }
        void clear() { items.clear(); discount = 0; }
        String receipt() {
            if (items.isEmpty()) throw new IllegalArgumentException("Agrega un producto antes de crear el recibo.");
            StringBuilder output = new StringBuilder();
            output.append("          STUDIOS CONARI\n")
                .append("     CAJA DE PEQUEÑAS MARAVILLAS\n")
                .append("\n       RECIBO DE DEMOSTRACIÓN\n")
                .append("      SIN VALIDEZ TRIBUTARIA\n\n")
                .append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append('\n')
                .append("------------------------------------\n");
            for (Map.Entry<Product, Integer> item : items.entrySet()) {
                Product product = item.getKey();
                output.append(product.name).append('\n')
                    .append("  ").append(item.getValue()).append(" × ").append(money(product.price))
                    .append(" = ").append(money(product.price * item.getValue())).append('\n');
            }
            output.append("------------------------------------\n")
                .append("Subtotal: ").append(money(subtotal())).append('\n')
                .append("Descuento (").append(discount).append(" %): −").append(money(reduction())).append('\n')
                .append("TOTAL: ").append(money(total())).append("\n\n")
                .append("No se realizó ningún cobro.\n")
                .append("Precios y productos ilustrativos.\n\n")
                .append("Donde nacen mundos\ny leyendas eternas.\n");
            return output.toString();
        }
    }

    private static final class RegisterPanel extends JPanel {
        final Product[] catalog = {
            new Product("Postal de constelaciones", 2500, "Papelería"),
            new Product("Lámina Bosque de las hadas", 8500, "Ilustración"),
            new Product("Cuaderno de mundos", 6500, "Papelería"),
            new Product("Set de stickers mágicos", 3500, "Ilustración"),
            new Product("Marcapáginas lunar", 1800, "Papelería")
        };
        final Cart cart = new Cart();
        final DefaultTableModel rows = new DefaultTableModel(new Object[]{"Producto", "Unidades", "Precio", "Importe"}, 0) {
            @Override public boolean isCellEditable(int row, int column) { return false; }
        };
        final JTable table = new JTable(rows);
        final List<Product> visibleProducts = new ArrayList<>();
        final JSpinner discount = new JSpinner(new SpinnerNumberModel(0, 0, 100, 1));
        final JLabel subtotal = new JLabel();
        final JLabel reduction = new JLabel();
        final JLabel total = new JLabel();
        final JLabel feedback = new JLabel("Elige una pequeña maravilla para comenzar.");
        final JTextArea receipt = new JTextArea();

        RegisterPanel() {
            super(new BorderLayout(16, 16));
            setBorder(new EmptyBorder(20, 20, 20, 20));
            JPanel shop = card(new BorderLayout(12, 12));
            JPanel selector = new JPanel(new GridBagLayout());
            selector.setOpaque(false);
            GridBagConstraints constraints = new GridBagConstraints();
            constraints.insets = new Insets(0, 0, 8, 8);
            constraints.fill = GridBagConstraints.HORIZONTAL;
            constraints.anchor = GridBagConstraints.WEST;
            constraints.gridx = 0; constraints.gridy = 0; constraints.weightx = 1;
            JLabel heading = new JLabel("Pequeños tesoros, grandes historias");
            heading.setFont(BODY.deriveFont(Font.BOLD, 18f));
            constraints.gridwidth = 3;
            selector.add(heading, constraints);
            constraints.gridwidth = 1; constraints.gridy = 1;
            JComboBox<Product> products = new JComboBox<>(catalog);
            products.setFont(BODY);
            products.getAccessibleContext().setAccessibleName("Producto ilustrativo");
            products.setMaximumRowCount(5);
            selector.add(products, constraints);
            constraints.gridx = 1; constraints.weightx = 0;
            JSpinner quantity = new JSpinner(new SpinnerNumberModel(1, 1, 99, 1));
            quantity.setPreferredSize(new Dimension(64, 42));
            quantity.setFont(BODY);
            quantity.getAccessibleContext().setAccessibleName("Cantidad de unidades");
            selector.add(quantity, constraints);
            constraints.gridx = 2;
            selector.add(button("Agregar", "Agregar producto y cantidad al carrito", () -> {
                try {
                    quantity.commitEdit();
                    cart.add((Product) products.getSelectedItem(), (Integer) quantity.getValue());
                    refresh(true); feedback.setText("Producto agregado. Tu carrito está actualizado.");
                } catch (Exception exception) { feedback.setText(message(exception)); }
            }), constraints);
            shop.add(selector, BorderLayout.NORTH);
            table.setFont(BODY.deriveFont(13f));
            table.setRowHeight(35);
            table.setBackground(PAPER);
            table.setForeground(INK);
            table.setSelectionBackground(PINK);
            table.setSelectionForeground(INK);
            table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
            table.getTableHeader().setFont(BODY.deriveFont(Font.BOLD, 12f));
            table.getTableHeader().setReorderingAllowed(false);
            table.getColumnModel().getColumn(0).setPreferredWidth(225);
            table.getColumnModel().getColumn(1).setPreferredWidth(55);
            table.getColumnModel().getColumn(2).setPreferredWidth(90);
            table.getColumnModel().getColumn(3).setPreferredWidth(100);
            table.getAccessibleContext().setAccessibleName("Carrito de productos");
            JScrollPane tableScroll = new JScrollPane(table);
            tableScroll.setPreferredSize(new Dimension(560, 240));
            shop.add(tableScroll, BorderLayout.CENTER);
            JPanel summary = new JPanel(new BorderLayout(10, 10));
            summary.setOpaque(false);
            JPanel actions = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
            actions.setOpaque(false);
            actions.add(button("Quitar selección", "Quitar del carrito el producto seleccionado", () -> {
                int selected = table.getSelectedRow();
                if (selected < 0) { feedback.setText("Selecciona una fila del carrito para quitarla."); return; }
                cart.remove(visibleProducts.get(selected)); refresh(true);
                feedback.setText("Producto retirado del carrito.");
            }));
            actions.add(button("Vaciar", "Vaciar carrito y borrar recibo", () -> {
                cart.clear(); discount.setValue(0); refresh(true);
                feedback.setText("Carrito vacío. Puedes crear otra combinación.");
            }));
            summary.add(actions, BorderLayout.NORTH);
            JPanel totals = new JPanel(new GridLayout(4, 1, 4, 5));
            totals.setOpaque(false);
            JPanel discountRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
            discountRow.setOpaque(false);
            JLabel discountLabel = new JLabel("Descuento (%)");
            discountLabel.setLabelFor(discount);
            discount.setFont(BODY);
            discount.getAccessibleContext().setAccessibleName("Porcentaje de descuento entre cero y cien");
            discountRow.add(discountLabel); discountRow.add(discount);
            discount.addChangeListener(event -> {
                cart.discount((Integer) discount.getValue()); refresh(true);
            });
            totals.add(discountRow); totals.add(subtotal); totals.add(reduction);
            total.setFont(BODY.deriveFont(Font.BOLD, 22f));
            total.setForeground(ROSE); totals.add(total);
            summary.add(totals, BorderLayout.CENTER);
            shop.add(summary, BorderLayout.SOUTH);
            add(shop, BorderLayout.CENTER);
            JPanel ticket = card(new BorderLayout(12, 12));
            ticket.setPreferredSize(new Dimension(290, 0));
            JLabel ticketTitle = new JLabel("Tu recibo", SwingConstants.CENTER);
            ticketTitle.setFont(BODY.deriveFont(Font.BOLD, 20f));
            ticket.add(ticketTitle, BorderLayout.NORTH);
            receipt.setEditable(false);
            receipt.setLineWrap(true);
            receipt.setWrapStyleWord(true);
            receipt.setFont(new Font("Monospaced", Font.PLAIN, 12));
            receipt.setBackground(PAPER);
            receipt.setForeground(INK);
            receipt.setBorder(new EmptyBorder(10, 8, 10, 8));
            receipt.getAccessibleContext().setAccessibleName("Recibo de demostración, sin validez tributaria");
            ticket.add(new JScrollPane(receipt), BorderLayout.CENTER);
            JPanel receiptActions = new JPanel(new GridLayout(2, 1, 0, 8));
            receiptActions.setOpaque(false);
            receiptActions.add(button("Crear recibo", "Crear recibo de demostración sin cobro", () -> {
                try {
                    discount.commitEdit();
                    receipt.setText(cart.receipt()); receipt.setCaretPosition(0);
                    feedback.setText("Recibo de demostración listo. No se realizó ningún cobro.");
                } catch (Exception exception) { feedback.setText(message(exception)); }
            }));
            receiptActions.add(button("Copiar recibo", "Copiar recibo al portapapeles", () -> {
                if (receipt.getText().isBlank()) { feedback.setText("Primero crea un recibo."); return; }
                try {
                    Toolkit.getDefaultToolkit().getSystemClipboard().setContents(new StringSelection(receipt.getText()), null);
                    feedback.setText("Recibo copiado al portapapeles.");
                } catch (RuntimeException exception) { feedback.setText("No se pudo copiar. Puedes seleccionar el texto del recibo."); }
            }));
            ticket.add(receiptActions, BorderLayout.SOUTH);
            add(ticket, BorderLayout.EAST);
            JPanel foot = new JPanel(new GridLayout(2, 1, 4, 5));
            feedback.setFont(BODY.deriveFont(12f));
            feedback.getAccessibleContext().setAccessibleName("Estado de la caja registradora");
            foot.add(feedback);
            JLabel disclaimer = new JLabel("Productos y precios ilustrativos · Sin pagos reales · Sin validez tributaria");
            disclaimer.setFont(BODY.deriveFont(12f));
            foot.add(disclaimer);
            add(foot, BorderLayout.SOUTH);
            refresh(false);
        }

        void refresh(boolean invalidateReceipt) {
            visibleProducts.clear(); rows.setRowCount(0);
            for (Map.Entry<Product, Integer> item : cart.items.entrySet()) {
                Product product = item.getKey(); visibleProducts.add(product);
                rows.addRow(new Object[]{product.name, item.getValue(), money(product.price), money(product.price * item.getValue())});
            }
            subtotal.setText("Subtotal  " + money(cart.subtotal()));
            reduction.setText("Descuento  −" + money(cart.reduction()));
            total.setText("Total  " + money(cart.total()));
            if (invalidateReceipt) receipt.setText("");
        }

        static String message(Exception exception) {
            return exception instanceof java.text.ParseException ? "Escribe un número entero válido en el campo seleccionado." : exception.getMessage();
        }
    }

    private static int checks = 0;

    private static void check(boolean passed, String description) {
        if (!passed) throw new AssertionError("Fallo: " + description);
        checks++;
    }

    private static void equal(BigDecimal actual, String expected, String description) {
        check(actual.compareTo(new BigDecimal(expected)) == 0, description);
    }

    private static void rejects(Runnable action, String description) {
        try { action.run(); } catch (IllegalArgumentException expected) { checks++; return; }
        throw new AssertionError("No se rechazó: " + description);
    }

    private static Calculator enter(String... keys) {
        Calculator calculator = new Calculator();
        for (String key : keys) calculator.press(key);
        return calculator;
    }

    static void runTests() {
        checks = 0;
        equal(calculate(new BigDecimal("0.1"), "+", new BigDecimal("0.2")), "0.3", "suma decimal exacta");
        equal(calculate(new BigDecimal("4"), "−", new BigDecimal("7")), "-3", "resta negativa");
        equal(calculate(new BigDecimal("2.5"), "×", new BigDecimal("4")), "10", "multiplicación");
        equal(calculate(new BigDecimal("7"), "÷", new BigDecimal("2")), "3.5", "división");
        rejects(() -> calculate(BigDecimal.ONE, "÷", BigDecimal.ZERO), "división por cero");
        equal(unary(new BigDecimal("25"), "%"), "0.25", "porcentaje");
        equal(unary(new BigDecimal("100"), "log₁₀"), "2", "logaritmo base diez");
        equal(unary(BigDecimal.ONE, "ln"), "0", "logaritmo natural");
        rejects(() -> unary(BigDecimal.ZERO, "ln"), "logaritmo de cero");
        rejects(() -> unary(new BigDecimal("-2"), "log₁₀"), "logaritmo negativo");
        rejects(() -> calculate(new BigDecimal("1E100"), "×", BigDecimal.TEN), "resultado fuera de rango");
        equal(enter("1", "5", "0", "×", "2", "0", "%", "=").value(), "30", "porcentaje de una cantidad");
        equal(enter("2", "+", "3", "×", "4", "=").value(), "20", "orden de entrada");
        equal(enter("2", "+", "−", "1", "=").value(), "1", "cambio de operador");
        equal(enter("1", ".", "2", ".", "3").value(), "1.23", "un separador decimal");
        equal(enter("1", "2", "⌫").value(), "1", "retroceso");
        equal(enter("8", "C", "3").value(), "3", "limpiar");
        equal(enter("7", "+/−").value(), "-7", "cambio de signo");
        Calculator afterError = enter("1", "÷", "0", "=");
        check(afterError.message.contains("cero"), "mensaje de error");
        afterError.press("4"); equal(afterError.value(), "4", "recuperación tras error");
        Product book = new Product("Cuaderno", 6500, "Papelería");
        Product card = new Product("Postal", 2500, "Papelería");
        Cart cart = new Cart();
        rejects(cart::receipt, "recibo vacío");
        cart.add(book, 2); cart.add(card, 1);
        check(cart.subtotal() == 15500, "subtotal carrito");
        cart.add(card, 2); check(cart.items.get(card) == 3, "agrupar producto");
        cart.discount(10); check(cart.reduction() == 2050 && cart.total() == 18450, "descuento 10 por ciento");
        check(cart.receipt().contains("SIN VALIDEZ TRIBUTARIA") && cart.receipt().contains("TOTAL:"), "recibo simulado");
        cart.discount(100); check(cart.total() == 0, "descuento completo");
        rejects(() -> cart.discount(101), "descuento superior a cien");
        rejects(() -> cart.discount(-1), "descuento negativo");
        rejects(() -> cart.add(book, 0), "cantidad cero");
        rejects(() -> cart.add(book, -1), "cantidad negativa");
        rejects(() -> cart.add(book, 98), "límite acumulado de unidades");
        cart.remove(book); check(cart.items.size() == 1, "quitar producto");
        cart.clear(); check(cart.items.isEmpty() && cart.total() == 0 && cart.discount == 0, "vaciar carrito");
        cart.add(new Product("Redondeo", 105, "Prueba"), 1); cart.discount(10);
        check(cart.reduction() == 11 && cart.total() == 94, "redondear descuento al peso");
        System.out.println("Correcto: " + checks + " comprobaciones de lógica superadas.");
    }
}
