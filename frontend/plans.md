Stock dept: (All of these will be visible to owner and admin)
A new supplier section:
    -list of current suppliers, line graph (multiple lines representing each suppliers)
    -Add new supplier tab:
        -Supplier name
        -Supplier phone
        -Supplier address
        -Supplier email
    -shipments section:
        -list of current shipments
        -Add new shipment tab:
            -supplier_name
            -number_of_products
            -delivery_date
        -pending shipments tab:
            -shows the shipments that are not yet received along with buttons arrived, not arrived, arrived late

Admin section:
    -all the same as above except one new section on the supplier section
        -rate supplier tab:
            -shows a list of the current suppliers with a button called rate supplier
            - when clicked, it will show the number of products received, number of products supposed to received,
            and a text filed to input damaged products
            -admin types in the number of damaged products and clicks submit, the ratio generates based upon total products received / total products supposed to received 
            (if the products supposed to receive & products receive is same then ratio will be done by products received / damaged products) this score will be shown on the line graph previously created, each shipment will create a point on the line graph a line will connect the dots giving a the admin and owner a general idea about the supplier performance

Owner section:
    -all the same as above except one new section on the supplier section
        -rate supplier tab:
            -shows a list of the current suppliers with a button called rate supplier
            - when clicked, it will show the number of products received, number of products supposed to received,
            and a text filed to input damaged products
            -owner types in the number of damaged products and clicks submit, the ratio generates based upon total products received / total products supposed to received 
            (if the products supposed to receive & products receive is same then ratio will be done by products received / damaged products) this score will be shown on the line graph previously created, each shipment will create a point on the line graph a line will connect the dots giving a the admin and owner a general idea about the supplier performance