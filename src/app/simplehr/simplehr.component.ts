import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { TdLoadingService } from '@covalent/core';
import { TdDialogService } from '@covalent/core';

import { SimplehrService } from '../../services';

import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';

import {Observable} from 'rxjs/Rx';


@Component({
  selector: 'qs-product-features',
  templateUrl: './simplehr.component.html',
  styleUrls: ['./simplehr.component.scss'],
  viewProviders: [ SimplehrService ],
})

export class SimplehrComponent implements OnInit {

  people: any[];

  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'ID', tooltip: 'ID', numeric: true },
    { name: 'username', label: 'Username', filter: true },
    { name: 'member_since', label: 'Member Since' },
    { name: 'first_name', label: 'First Name' },
    { name: 'last_name', label: 'Last Name' },
    { name: 'status', label: 'Status' },
  ];

  filteredData: any[] = [];
  filteredTotal: number = 0;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 5;
  sortBy: string = 'id';
  selectedRows: any[] = [];
  selectable: boolean = true;
  multiple: boolean = true;
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  filterStatus: number = -1;
  status: any = [{
      id: -1,
      name: 'All'
    }, {
        id: 1,
        name: 'Active'
    }, {
      id: 2,
      name: 'InActive'
    }, {
      id: 3,
      name: 'Disabled'
    }, {
      id: 4,
      name: 'Deleted'
  }];

  constructor(private _titleService: Title,
              private _dialogService: TdDialogService,
              private _simplehrService: SimplehrService,
              private _loadingService: TdLoadingService,
              private _dataTableService: TdDataTableService) {

  }

  openConfirm(id: string): void {
    this._dialogService.openConfirm({
      message: 'Are you sure you want to delete?',
      title: 'Confirm',
      cancelButton: 'No, Cancel',
      acceptButton: 'Yes, Delete',
    }).afterClosed().subscribe((accept: boolean) => {
      if (accept) {
        this.deletePeople();
      }
    });
  }

  ngOnInit(): void {
    this._titleService.setTitle( 'Users' );
    this.loadPeople();
  }

  loadPeople(): void {
    this._loadingService.register('people.list');
    this._simplehrService.query().subscribe(people => {
      this.people = people;
      this._loadingService.resolve('people.list');
      this.filter();
    }, (error: Error) => {
      this._simplehrService.failedQuery().subscribe(people => {
        this.people = people;
        this._loadingService.resolve('people.list');
        this.filter();
      });
    });
  }

  deletePeople(): void {
    this._loadingService.register('people.list');

    let deletePromises = this.selectedRows.map((rows) => {
      return this._simplehrService.delete(rows.id);
    });

    let ids = this.selectedRows.map(row => row.id);

    Observable.forkJoin(deletePromises).subscribe(t => {
      this.people = this.people.filter(people => {
        return !~ids.indexOf(people.id);
      });
      this.filter();
      this.selectedRows = [];
      this._loadingService.resolve('people.list');
    }, (error: Error) => {
      this.people = this.people.filter(people => {
        return !~ids.indexOf(people.id);
      });
      this.filter();
      this.selectedRows = [];
      this._loadingService.resolve('people.list');
    });
  }

  getStatusText(id): any {
    return this.status.filter(stat => stat.id === parseInt(id));
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    let newData: any[] = this.people;
    let excludedColumns: string[] = this.columns
      .filter((column: ITdDataTableColumn) => {
        return ((column.filter === undefined && column.hidden === true) ||
               (column.filter !== undefined && column.filter === false));
      }).map((column: ITdDataTableColumn) => {
        return column.name;
      });

    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);

    newData = newData.map(data => {
      data.status = this.getStatusText(data.status_id)[0].name;
      return data;
    });

    if (this.filterStatus > -1) {
      let filterStatus:number  = this.filterStatus;
      newData = newData.filter(data => {
        return filterStatus == data.status_id;
      });
    }

    this.filteredData = newData;
  }
}
