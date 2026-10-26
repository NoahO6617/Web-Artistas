
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { provideRouter } from '@angular/router';
import { Callback } from './callback.component';

describe('Callback', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Callback],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(Callback);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});
